import redis = require('redis');
import bluebird = require('bluebird');
import logger from './logger';
import { AxiosRequestConfig } from 'axios';
import config from '../config';
import { trackRedis } from './insight';
import Utils from '../utils/utils';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export interface IRedisClient {
  setCache(data: any, axiosRequest: AxiosRequestConfig, durationSeconds?: number): Promise<boolean>;
  getCache<T>(axiosRequest: AxiosRequestConfig): Promise<T>;
  cleanCache(url: string, params?: any): Promise<boolean>;
  isConnected(): boolean;
}

class RedisClient implements IRedisClient {
  private readonly defaultCacheTime: number = config.redis.cacheTime;
  private readonly cacheConnection: redis.RedisClient = redis.createClient(6380, process.env.REDISCACHEHOSTNAME, {
    auth_pass: process.env.REDISCACHEKEY,
    tls: { servername: process.env.REDISCACHEHOSTNAME }
  });

  public async setCache(
    data: any,
    axiosRequest: AxiosRequestConfig,
    durationSeconds: number = this.defaultCacheTime
  ): Promise<boolean> {
    try {
      const dataKey: string = this.generateKey(axiosRequest.url, axiosRequest.params);
      logger.debug(`Redis - Guardando cache de key: ${dataKey}. Tiempo Cache: ${durationSeconds} segundos`);
      const response: string = await this.cacheConnection.setAsync(dataKey, JSON.stringify(data));
      const expireResponse: string = await this.cacheConnection.expireAsync(dataKey, durationSeconds);
      logger.debug(`Redis - Response ${response} - CacheTime Response: ${expireResponse}`);

      return response == 'OK';
    } catch (e) {
      logger.error('Redis - Error al guardar datos en cache', e);
      return false;
    }
  }

  public async getCache<T>(axiosRequest: AxiosRequestConfig): Promise<T> {
    const startTime: number = Date.now();
    try {
      const dataKey: string = this.generateKey(axiosRequest.url, axiosRequest.params);
      logger.debug(`Redis - Consultando datos cache de: ${dataKey}`);
      const data: string = await this.cacheConnection.getAsync(dataKey);
      logger.debug(data ? 'Redis - Datos leidos desde cache.' : 'Sin datos en Cache');
      trackRedis(JSON.parse(data, Utils.dateParser), dataKey, startTime);
      return JSON.parse(data) as T;
    } catch (e) {
      logger.error('Redis - Error al obtener datos de cache', e);
      return undefined;
    }
  }

  public async cleanCache(url: string, params: any): Promise<boolean> {
    const dataKey: string = this.generateKey(url, params);
    logger.debug(`Cleaning cache from : ${dataKey}`);
    const response: string = await this.cacheConnection.delAsync(dataKey);
    return response == '1';
  }

  private generateKey(url: string, params?: any): string {
    return config.nodeEnv + new URL(url).pathname + this.paramsToString(params);
  }

  private paramsToString(params: Record<string, any>): string {
    if (!params) return '';
    let stringparams = '?';
    const paramsLength: number = Object.keys(params).length;
    for (let i = 0; i < paramsLength; i++) {
      const key: string = Object.keys(params)[i];
      stringparams = `${stringparams}${key}=${params[key]}`;
      stringparams = stringparams + (i + 1 == paramsLength ? '' : '&');
    }
    return stringparams;
  }

  isConnected(): boolean {
    return this.cacheConnection.connected;
  }
}

const redisInstance: RedisClient = new RedisClient();
export default redisInstance;
