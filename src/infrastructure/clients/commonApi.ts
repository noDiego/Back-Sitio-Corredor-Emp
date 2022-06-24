import { Inject, Service } from 'typedi';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { URLS } from '../../constants/urls';
import breakerInstance from '../../utils/circuitBreaker/breakerInstance';
import { CircuitBreaker } from '../../utils/circuitBreaker/circuitBreaker';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { getVSHeaders } from '../../constants/headers';
import winston from 'winston';
import { logError, logResponse } from '../../utils/logutils';
import { resolveError } from '../../utils/apiutils';
import { ICommonAdapter } from '../../domain/interfaces/adapter/ICommonAdapter';
import config from '../../config';
import { CategoryResponse, CityResponse, CommuneResponse, FileResponse } from './dto/common';
import categoriesConverter from './converters/categoriesConverter';
import { ICodeObject } from '../../domain/interfaces/dto/v3/ICodeObject';
import citiesConverter from './converters/citiesConverter';
import { Ciudad } from '../../domain/interfaces/dto/v3/ILocalidad';
import { File } from '../../domain/interfaces/dto/v3/IFile';
import communeConverter from './converters/communeConverter';
import fileConverter from './converters/fileConverter';

@Service('CommonApi')
export default class CommonApi implements ICommonAdapter {
  @Inject('logger') private readonly logger: winston.Logger;

  async getCategories(categorieCode: string, userSSO: IUserSSO): Promise<ICodeObject[]> {
    const serviceName = 'Category';
    const urlApi: string = URLS.commonApi.categories + categorieCode;
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a getCategories con codigo: ' + categorieCode);

    const params: any = {
      SystemCode: config.VSSystemCode
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<CategoryResponse> = await axiosBreaker.exec<CategoryResponse>(
        axiosRequest,
        true,
        604800
      );
      logResponse(response, urlApi, userSSO.transactionID);

      return categoriesConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }
  async getCities(userSSO: IUserSSO): Promise<Ciudad[]> {
    const serviceName = 'Cities';
    const urlApi: string = URLS.commonApi.cities;
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a getCities');

    const params: any = {
      SystemCode: config.VSSystemCode
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<CityResponse> = await axiosBreaker.exec<CityResponse>(axiosRequest, true, 604800);
      logResponse(response, urlApi, userSSO.transactionID);

      return citiesConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }
  async getCommunes(userSSO: IUserSSO): Promise<any[]> {
    const serviceName = 'Communes';
    const urlApi: string = URLS.commonApi.communes;
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a getCommunes');

    const params: any = {
      SystemCode: config.VSSystemCode
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<CommuneResponse> = await axiosBreaker.exec<CommuneResponse>(
        axiosRequest,
        true,
        604800
      );
      logResponse(response, urlApi, userSSO.transactionID);

      return communeConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }
  async getFileToken(token: number, userSSO: IUserSSO): Promise<File> {
    const serviceName = 'FileToken';
    const urlApi: string = URLS.commonApi.fileToken + token;
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a getFileToken con token:' + token);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO)
    };

    try {
      const response: AxiosResponse<FileResponse> = await axiosBreaker.exec<FileResponse>(axiosRequest, false, 604800);
      logResponse(response, urlApi, userSSO.transactionID);

      return fileConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }
}
