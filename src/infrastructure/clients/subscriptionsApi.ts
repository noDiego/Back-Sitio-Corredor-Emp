import { Inject, Service } from 'typedi';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { URLS } from '../../constants/urls';
import breakerInstance from '../../utils/circuitBreaker/breakerInstance';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { getVSHeaders } from '../../constants/headers';
import { logError, logResponse } from '../../utils/logutils';
import { buildPagedResponse, resolveError } from '../../utils/apiutils';
import { Logger } from '../../loaders/logger';
import { ISubscriptionsAdapter } from '../../domain/interfaces/adapter/ISubscriptionsAdapter';
import { IInsuranceReqInput, IInsuranceRequirement } from '../../domain/interfaces/dto/v3/IInsuranceRequirement';
import insuranceRequirementConverter from './converters/insuranceRequirementConverter';
import { IPagedResponse } from '../../domain/interfaces/dto/v1/IResponse';
import { InsuranceReqResponse, InsuranceRequirement } from './dto/insuranceRequirement';
import Utils from '../../utils/utils';
import { InsuredVirtualSubscription, VirtualSubscriptionResponse } from './dto/insured';
import { CircuitBreaker } from '../../utils/circuitBreaker/circuitBreaker';

@Service('SubscriptionsApi')
export default class SubscriptionsApi implements ISubscriptionsAdapter {
  @Inject('logger') private readonly logger: Logger;

  async getInsuranceRequirements(
    input: IInsuranceReqInput,
    page: number,
    limit: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IInsuranceRequirement>> {
    const serviceName = 'InsuranceRequirements';
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);
    const urlApi: string = URLS.subscriptionApi.insuranceRequirement;

    const params: any = {
      PolicyNum: input.policyNum,
      RutAsegurado: input.insuredRut,
      RutBroker: input.rutBroker,
      RutCo: input.rutCo,
      RutInsurCo: input.rutInsurCo,
      Page: page,
      Offset: limit
    };

    this.logger.info('Llamando a ' + serviceName + ' con datos: ' + JSON.stringify(Utils.jsonClean(params)));
    this.logger.debug('URL Service: ' + urlApi);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: Utils.jsonClean(params)
    };

    try {
      const response: AxiosResponse<InsuranceReqResponse> = await axiosBreaker.exec<InsuranceReqResponse>(
        axiosRequest,
        true
      );
      logResponse(response, urlApi);

      const quotaMax: number = response.data.pagination.quotaMax;
      const reqList: IInsuranceRequirement[] = [];
      response.data.insuranceRequirement.forEach((insurReq: InsuranceRequirement) => {
        const insurReqConverted: IInsuranceRequirement = insuranceRequirementConverter(insurReq);
        reqList.push(insurReqConverted);
      });

      return buildPagedResponse<IInsuranceRequirement>(reqList, page, limit, quotaMax);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName, true);
    }
  }

  async virtualSubscription(
    insuredsArray: InsuredVirtualSubscription[],
    userSSO: IUserSSO
  ): Promise<VirtualSubscriptionResponse> {
    const serviceName = 'VirtualSubscription';
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);
    const urlApi: string = URLS.subscriptionApi.virtualSubscription;

    const inputData: any = {
      user: userSSO.preferredUsername,
      insured: insuredsArray
    };

    this.logger.info('Llamando a ' + serviceName + ' con datos: ' + JSON.stringify(Utils.jsonClean(inputData)));
    this.logger.debug('URL Service: ' + urlApi);

    const axiosRequest: AxiosRequestConfig = {
      method: 'post',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      data: Utils.jsonClean(inputData)
    };

    try {
      const response: AxiosResponse<VirtualSubscriptionResponse> = await axiosBreaker.exec<VirtualSubscriptionResponse>(
        axiosRequest
      );
      logResponse(response, urlApi, userSSO.transactionID);

      return response.data;
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName, true);
    }
  }
}
