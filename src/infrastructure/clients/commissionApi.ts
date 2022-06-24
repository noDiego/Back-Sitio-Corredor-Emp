import { Inject, Service } from 'typedi';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getVSHeaders } from '../../constants/headers';
import breakerInstance from '../../utils/circuitBreaker/breakerInstance';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import winston from 'winston';
import { ICommissionAdapter } from '../../domain/interfaces/adapter/ICommissionAdapter';
import { URLS } from '../../constants/urls';
import { CommissionPeriodsRes, IntermediaryRes, TotalsResp } from './dto/commission';
import { CircuitBreaker } from '../../utils/circuitBreaker/circuitBreaker';
import { logError, logResponse } from '../../utils/logutils';
import { resolveError } from '../../utils/apiutils';
import commissionPeriodConverter from './converters/commissionPeriodConverter';
import { ICommissionPeriodsRes, Intermediary, ICommissionTotals } from '../../domain/interfaces/dto/v3/ICommission';
import intermediaryConverter from './converters/intermediaryConverter';
import config from '../../config';
import commissionTotalsConverter from './converters/commissionTotalsConverter';

@Service('CommissionApi')
export default class CommissionApi implements ICommissionAdapter {
  @Inject('logger') private readonly logger: winston.Logger;

  async getIntermediaryCode(brokerRut: string, user: IUserSSO): Promise<Intermediary[]> {
    this.logger.info(`Llamando a getIntermediaryCode con brokerRut: ${brokerRut}`);
    const serviceName = 'CommissionIntermediary';
    const urlApi: string = URLS.commissionApi.commissionsIntermediary + brokerRut;

    this.logger.debug('URL Service: ' + urlApi);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user)
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<IntermediaryRes> = await axiosBreaker.exec<IntermediaryRes>(axiosRequest, true);
      logResponse(response, urlApi, user.transactionID);
      return intermediaryConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getCommissionPeriods(intermediaryCode: string, user: IUserSSO): Promise<ICommissionPeriodsRes> {
    this.logger.info(`Llamando a getCommissionPeriods con intermediaryCode: ${intermediaryCode}`);
    const serviceName = 'CommissionPeriods';
    const urlApi: string = URLS.commissionApi.commissionsPeriods;
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      InterCode: intermediaryCode
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user),
      params: params
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<CommissionPeriodsRes> = await axiosBreaker.exec<CommissionPeriodsRes>(
        axiosRequest,
        true
      );
      logResponse(response, urlApi, user.transactionID);
      return commissionPeriodConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getCommissionsTotals(intermediaryCode: string, period: number, user: IUserSSO): Promise<ICommissionTotals> {
    this.logger.info(`Llamando a getCommissionsTotal con intermediaryCode: ${intermediaryCode} y period: ${period}`);
    const serviceName = 'CommissionsTotals';
    const urlApi: string = URLS.commissionApi.commissionsByTotals;
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      InterCode: intermediaryCode,
      Period: period,
      Negocio: config.commission.bussinessCode
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user),
      params: params
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<TotalsResp> = await axiosBreaker.exec<TotalsResp>(axiosRequest, true);
      logResponse(response, urlApi, user.transactionID);
      return commissionTotalsConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }
}
