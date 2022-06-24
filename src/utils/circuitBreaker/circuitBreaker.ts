import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { BreakerState } from './breakerStates';
import { BreakerOptions } from './breakerOptions';
import { IRedisClient } from '../../loaders/redis';
import { Container } from 'typedi';
import { Logger } from '../../loaders/logger';
import { trackDependency } from '../../loaders/insight';
import NodeClient from 'applicationinsights/out/Library/NodeClient';
import { HttpError } from '../../infrastructure/clients/dto/httpErrorMayus';
import { fixHttpError } from '../apiutils';

export class CircuitBreaker {
  private state: BreakerState;
  private readonly redisClient: IRedisClient = Container.get('RedisClient');
  private readonly logger: Logger = Container.get('logger');

  private failureCount: number;
  private successCount: number;

  private nextAttempt: number;

  // Options
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly timeout: number;

  constructor(options: BreakerOptions) {
    this.state = BreakerState.GREEN;

    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.failureThreshold = options.failureThreshold;
    this.successThreshold = options.successThreshold;
    this.timeout = options.timeout;
  }

  public async exec<T>(request: AxiosRequestConfig, cache = false, cacheSeconds?: number): Promise<AxiosResponse<T>> {
    const cachedData: T = cache ? await this.redisClient.getCache<T>(request) : null;
    if (cachedData)
      return {
        config: request,
        data: cachedData,
        headers: undefined,
        request: request,
        status: 200,
        statusText: 'CACHED'
      };

    if (this.state === BreakerState.RED) {
      if (this.nextAttempt <= Date.now()) {
        this.state = BreakerState.YELLOW;
      } else {
        throw new Error('Circuit suspended. You shall not pass.');
      }
    }

    const startTime: number = Date.now();

    try {
      const response: AxiosResponse = await axios(request);

      if (response.status === 200 || response.status === 201) {
        trackDependency(response, request, startTime, true);

        //Parche para error en servicios
        this.validaErrorCode(response, request);
        //Fin Parche

        if (cache) await this.redisClient.setCache(response.data, request, cacheSeconds); // Guardando en Cache REDIS (Solo con 200)

        return this.success(response);
      } else {
        if (response.status >= 500) {
          trackDependency(response, request, startTime, false);
          this.failure();
        } else {
          trackDependency(response, request, startTime, true);
        }
        return response;
      }
    } catch (err) {
      if (err.response && err.response.status >= 500) this.failure();
      trackDependency(err.response, request, startTime, false, err);
      throw err;
    }
  }

  private validaErrorCode(response: AxiosResponse, request: AxiosRequestConfig): void {
    const timeOutError = '<h1>504 Gateway Time-out</h1>';
    let httpErrorResponse: HttpError;
    const insightClient: NodeClient = Container.get<NodeClient>('InsightClient');

    if (!!response.data.httpCode || !!response.data.HttpCode) {
      httpErrorResponse = fixHttpError(response.data);
    } else if (String(response.data).includes(timeOutError)) {
      insightClient.trackException({
        exception: new Error('Error timeout con status 200'),
        properties: {
          error: { name: 'Error inconsistencia', message: 'Error timeout con status 200' },
          response: {
            data: response.data,
            status: response.status,
            statusText: response.statusText
          },
          request: {
            url: request.url,
            params: request.params,
            data: request.data,
            headers: request.headers,
            method: request.method
          }
        }
      });
      this.logger.error(`Manejando respuesta inconsistente en servicio [${request.url}] con Params [${JSON.stringify(
        request.params
      )}] 
      Response data con informacion invalida. response.data = ${JSON.stringify(response.data)}`);
      throw { response: response, name: 'VS API TIMEOUT', message: response.data, config: request };
    }

    if (!!httpErrorResponse && httpErrorResponse.httpCode != response.status) {
      insightClient.trackException({
        exception: new Error('HttpCode no coincide con Response.status'),
        properties: {
          error: { name: 'Error inconsistencia', message: 'HttpCode no coincide con Response.status' },
          response: {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          },
          request: {
            url: request.url,
            params: request.params,
            headers: request.headers
          }
        }
      });
      this.logger.error(`Manejando respuesta inconsistente en servicio [${request.url}] con Params [${JSON.stringify(
        request.params
      )}] 
      Response.status = ${response.status} - response.body.httpCode:${httpErrorResponse.httpCode}`);
      response.status = httpErrorResponse.httpCode;
      throw {
        response: response,
        name: httpErrorResponse.httpMessage,
        message: httpErrorResponse.moreInformation,
        config: request
      };
    }
    return;
  }

  private success(res: AxiosResponse): AxiosResponse {
    this.failureCount = 0;

    if (this.state === BreakerState.YELLOW) {
      this.successCount++;

      if (this.successCount > this.successThreshold) {
        this.successCount = 0;
        this.state = BreakerState.GREEN;
      }
    }
    return res;
  }

  private failure(): void {
    this.failureCount++;

    if (this.failureCount >= this.failureThreshold) {
      this.state = BreakerState.RED;
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
