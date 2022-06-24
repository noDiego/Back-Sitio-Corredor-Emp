import { Inject, Service } from 'typedi';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { URLS } from '../../constants/urls';
import { IPolicyAdapter } from '../../domain/interfaces/adapter/IPolicyAdapter';
import { Plan } from './dto/plan';
import breakerInstance from '../../utils/circuitBreaker/breakerInstance';
import { IPolicy } from '../../domain/interfaces/dto/v3/IPolicy';
import policyDetailConverter from './converters/policyDetailConverter';
import { IPlan } from '../../domain/interfaces/dto/v3/IPlan';
import planDetailConverter from './converters/planDetailConverter';
import { IInsured } from '../../domain/interfaces/dto/v3/IInsured';
import insuredDetailConverter from './converters/insuredDetailConverter';
import { PoliciesResponse } from './dto/policiesResponse';
import { InsuredsResponse } from './dto/insuredsResponse';
import { IPagedResponse } from '../../domain/interfaces/dto/v1/IResponse';
import { PolicyDetail, PolicyShort } from './dto/policy';
import { ContactInfoUpdate, InsuredDetail } from './dto/insured';
import insuredShortConverter from './converters/insuredShortConverter';
import policyShortConverter from './converters/policyShortConverter';
import { CircuitBreaker } from '../../utils/circuitBreaker/circuitBreaker';
import { PolicyCoverage } from './dto/product';
import insuredCoverageConverter from './converters/insuredCoverageConverter';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { getVSHeaders } from '../../constants/headers';
import winston from 'winston';
import { logError, logResponse } from '../../utils/logutils';
import { buildPagedResponse, getProductName, resolveError } from '../../utils/apiutils';
import { ReportResponse } from './dto/report';
import { HttpErrorMayus, HttpError } from './dto/httpErrorMayus';
import { IRedisClient } from '../../loaders/redis';
import { IServiceResponse } from '../../domain/interfaces/dto/v3/IServiceResponse';
import { httpErrorMinusConverter } from './converters/serviceResponseConverter';
import { IInsuredGroupChangeInput } from '../../domain/interfaces/dto/v3/IInsuredGroup';
import { ISubsidiaryChangeInput } from '../../domain/interfaces/dto/v3/ISubsidiary';

@Service('PolicyApi')
export default class PolicyApi implements IPolicyAdapter {
  @Inject('logger') private readonly logger: winston.Logger;
  @Inject('RedisClient') private readonly redisClient: IRedisClient;

  async getPolicyDetail(policyNumber: number, userSSO: IUserSSO): Promise<IPolicy> {
    const serviceName = 'PolicyByNumber';
    const urlApi: string = URLS.policyApi.uriBase + policyNumber;
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a getPolicyByNumber con numero: ' + policyNumber);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO)
    };

    try {
      const response: AxiosResponse<PolicyDetail> = await axiosBreaker.exec<PolicyDetail>(axiosRequest, true);
      logResponse(response, urlApi, userSSO.transactionID);

      return policyDetailConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getPoliciesByCompany(
    companyRut: number,
    rutInsuranceCo: number,
    page: number,
    limit: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IPolicy>> {
    const serviceName = 'PoliciesByCompany';
    const urlApi: string = URLS.policyApi.uriByInsurance + rutInsuranceCo + '/byCompany';
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a getPoliciesByCompany con companyRut: ' + companyRut);
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      CompanyRut: companyRut,
      Page: page,
      Offset: limit
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<PoliciesResponse> = await axiosBreaker.exec<PoliciesResponse>(axiosRequest, true);
      logResponse(response, urlApi, userSSO.transactionID);

      const quotaMax: number = response.data.pagination.quotaMax;
      const policiesList: IPolicy[] = [];

      response.data.policies.forEach((policy: PolicyShort) => {
        const policyConverted: IPolicy = policyShortConverter(policy);
        policiesList.push(policyConverted);
      });
      return buildPagedResponse<IPolicy>(policiesList, page, limit, quotaMax);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName, true);
    }
  }

  async getPoliciesByInsured(
    insuredRut: number,
    rutInsuranceCo: number,
    page: number,
    offset: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IPolicy>> {
    const serviceName = 'PoliciesByInsured';
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);
    this.logger.info('Llamando a ' + serviceName + ' con insuredRut: ' + insuredRut);

    const urlApi: string = URLS.policyApi.uriByInsurance + rutInsuranceCo + '/byInsured';
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      InsuredRut: insuredRut,
      Page: page,
      Offset: offset
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<PoliciesResponse> = await axiosBreaker.exec<PoliciesResponse>(axiosRequest, true);
      logResponse(response, urlApi, userSSO.transactionID);

      const quotaMax: number = response.data.pagination.quotaMax;
      const policiesList: IPolicy[] = [];

      response.data.policies.forEach((policy: PolicyShort) => {
        const policyConverted: IPolicy = policyShortConverter(policy);
        policiesList.push(policyConverted);
      });
      return buildPagedResponse<IPolicy>(policiesList, page, offset, quotaMax);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName, true);
    }
  }

  async getPoliciesByBroker(
    brokerRut: number,
    rutInsuranceCo: number,
    page: number,
    limit: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IPolicy>> {
    const serviceName = 'PoliciesByBroker';
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);
    const urlApi: string = URLS.policyApi.uriByInsurance + rutInsuranceCo + '/byBroker';

    this.logger.info('Llamando a getPoliciesByBroker con brokerRut: ' + brokerRut);
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      BrokerRut: brokerRut,
      Page: page,
      Offset: limit
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<PoliciesResponse> = await axiosBreaker.exec<PoliciesResponse>(axiosRequest, true);
      logResponse(response, urlApi);

      const quotaMax: number = response.data.pagination.quotaMax;
      const policiesList: IPolicy[] = [];

      response.data.policies.forEach((policy: PolicyShort) => {
        const policyConverted: IPolicy = policyShortConverter(policy);
        policiesList.push(policyConverted);
      });

      return buildPagedResponse<IPolicy>(policiesList, page, limit, quotaMax);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName, true);
    }
  }

  async getPlanDetail(renewalId: number, planCode: number, userSSO: IUserSSO): Promise<IPlan> {
    //TODO: Cambiar Salida
    this.logger.info(`Llamando a getPlanDetailBy con renewalId: ${renewalId} y planCode: ${planCode}`);
    const serviceName = 'PlanDetail';
    const urlApi: string = URLS.policyApi.uriBase + renewalId + '/plan/' + planCode;
    this.logger.debug('URL Service: ' + urlApi);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO)
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<Plan> = await axiosBreaker.exec<Plan>(axiosRequest, true);
      logResponse(response, urlApi, userSSO.transactionID);
      return planDetailConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getInsuredDetail(policyNumber: number, insuredRut: number, userSSO: IUserSSO): Promise<IInsured> {
    this.logger.info(`Llamando a getInsuredDetail con policyNumber: ${policyNumber} y insuredRut: ${insuredRut}`);
    const serviceName = 'InsuredDetail';
    const urlApi: string = URLS.policyApi.uriBase + policyNumber + '/insured/' + insuredRut;
    this.logger.debug('URL Service: ' + urlApi);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO)
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<InsuredDetail> = await axiosBreaker.exec<InsuredDetail>(axiosRequest, true);
      logResponse(response, urlApi, userSSO.transactionID);
      return insuredDetailConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async cleanInsuredDetailCache(policyNumber: number, insuredRut: number): Promise<boolean> {
    const serviceName = 'InsuredDetail';
    this.logger.info(
      `Generando datos para limpiar cache de ${serviceName} con policyNumber: ${policyNumber} y insuredRut: ${insuredRut}`
    );
    const urlApi: string = URLS.policyApi.uriBase + policyNumber + '/insured/' + insuredRut;
    const result: boolean = await this.redisClient.cleanCache(urlApi);
    this.logger.info(result ? 'Cache eliminado correctamente' : 'Error al eliminar el cache');
    return result;
  }

  async getInsuredsByPolicy(
    policyNumber: number,
    page: number,
    limit: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IInsured>> {
    this.logger.info(`Llamando a InsuredByPolicy con policyNumber: ${policyNumber}`);
    const serviceName = 'InsuredByPolicy';
    const urlApi: string = URLS.policyApi.uriBase + policyNumber + '/insured';
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      Page: page,
      Offset: limit
    };
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    const axiosRequest: AxiosRequestConfig = {
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<InsuredsResponse> = await axiosBreaker.exec<InsuredsResponse>(axiosRequest, true);
      logResponse(response, urlApi, userSSO.transactionID);
      const responseList: IInsured[] = [];
      response.data.insureds.forEach((insured: InsuredDetail) => {
        responseList.push(insuredShortConverter(insured));
      });

      return buildPagedResponse<IInsured>(responseList, page, limit, response.data.pagination.quotaMax);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName, true);
    }
  }

  async getInsuredCoverageByPolicy(
    policyCode: number,
    rutInsuranceCode: number,
    planCode: number,
    userSSO: IUserSSO
  ): Promise<IPlan> {
    this.logger.info(
      `Llamando a getInsuredCoverageByPolicy con policyCode: ${policyCode}, rutInsuranceCode: ${rutInsuranceCode} y  planCode: ${planCode}`
    );
    const serviceName = 'insuredCoverageByPolicy';
    const urlApi: string = URLS.policyApi.uriBase + policyCode + '/insured/' + rutInsuranceCode + '/plan/' + planCode;
    this.logger.debug('URL Service: ' + urlApi);

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    const axiosRequest: AxiosRequestConfig = {
      url: urlApi,
      headers: getVSHeaders(userSSO)
    };

    try {
      const response: AxiosResponse<PolicyCoverage> = await axiosBreaker.exec<PolicyCoverage>(axiosRequest, true);
      logResponse(response, urlApi, userSSO.transactionID);
      return insuredCoverageConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  public async updateInfoAsegurado(
    policyNumber: number,
    inputData: ContactInfoUpdate,
    userSSO: IUserSSO
  ): Promise<boolean> {
    this.logger.info(`Llamando a updateInfoAsegurado con policyCode: ${policyNumber}`);
    const serviceName = 'updateInfoAsegurado';
    const urlApi: string = URLS.policyApi.uriBase + policyNumber + '/insured/contactInfo';
    this.logger.debug('URL Service: ' + urlApi);

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    const axiosRequest: AxiosRequestConfig = {
      method: 'post',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      data: inputData
    };

    try {
      const response: AxiosResponse<HttpErrorMayus> = await axiosBreaker.exec<HttpErrorMayus>(axiosRequest, false);
      logResponse(response, urlApi, userSSO.transactionID);

      //Se inica la limpieza del caché para el asegurado actualizado
      const success: boolean = response.status == 200;
      if (response.status == 200) {
        await this.cleanInsuredDetailCache(policyNumber, inputData.rut);
      }

      return success;
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  //Reports

  async getReport(insuredRut: number, policyNumber: number, productCode: number, userSSO: IUserSSO): Promise<string> {
    this.logger.info(
      `Llamando a getReport con policyNumber: ${policyNumber} - insuredRut: ${insuredRut} - reportType: ${productCode}`
    );
    const serviceName = 'getReport';
    const productName: string = getProductName(productCode);
    const urlApi: string =
      URLS.policyApi.reports + policyNumber + '/insured/' + insuredRut + '/certificados/' + productName.toLowerCase();

    this.logger.debug('URL Service: ' + urlApi);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO)
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<ReportResponse> = await axiosBreaker.exec<ReportResponse>(axiosRequest, false);
      logResponse(response, urlApi, userSSO.transactionID);
      return response.data.base64;
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  public async exclusionInsured(
    insuredRut: number,
    insuredDV: string,
    policyNumber: number,
    endDate: Date,
    userSSO: IUserSSO
  ): Promise<IServiceResponse> {
    this.logger.info(`Llamando a exclusionInsured con policyCode: ${policyNumber} y insuredRut:${insuredRut}`);
    const serviceName = 'exclusionInsured';
    const urlApi: string = URLS.policyApi.uriBase + policyNumber + '/insured';
    this.logger.debug('URL Service: ' + urlApi);

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    const inputData: any = {
      rut: Number(insuredRut),
      dv: insuredDV,
      endDate: endDate,
      user: userSSO.preferredUsername
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'delete',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      data: inputData
    };

    try {
      const response: AxiosResponse<HttpError> = await axiosBreaker.exec<HttpError>(axiosRequest);
      logResponse(response, urlApi, userSSO.transactionID);
      return httpErrorMinusConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  public async insuredGroupChange(input: IInsuredGroupChangeInput, userSSO: IUserSSO): Promise<IServiceResponse> {
    this.logger.info(
      `Llamando a insuredGroupChange con policyCode: ${input.policyNumber}, insuredRut:${input.insuredRut} y insuredGroup:${input.insuredGroup}`
    );
    const serviceName = 'insuredGroupChange';
    const urlApi: string = URLS.policyApi.uriBase + input.policyNumber + '/insured/insuredGroup';
    this.logger.debug('URL Service: ' + urlApi);

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    const inputData: any = {
      rut: Number(input.insuredRut),
      dv: input.insuredDV,
      insuredGroup: input.insuredGroup,
      startDate: input.startDate,
      capital: input.capital ? input.capital : 0,
      rent: input.rent ? input.rent : 0,
      user: userSSO.preferredUsername
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'post',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      data: inputData
    };

    try {
      const response: AxiosResponse<HttpError> = await axiosBreaker.exec<HttpError>(axiosRequest);
      logResponse(response, urlApi, userSSO.transactionID);
      return httpErrorMinusConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  public async insuredSubsidiaryChange(input: ISubsidiaryChangeInput, userSSO: IUserSSO): Promise<IServiceResponse> {
    this.logger.info(
      `Llamando a insuredSubsidiaryChange con policyCode: ${input.policyNumber}, insuredRut:${input.insuredRut} y insuredGroup:${input.insuredGroup}`
    );
    const serviceName = 'insuredSubsidiaryChange';
    const urlApi: string = URLS.policyApi.uriBase + input.policyNumber + '/insured/' + input.insuredRut + '/subsidiary';
    this.logger.debug('URL Service: ' + urlApi);

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    const inputData: any = {
      insuredGroup: Number(input.insuredGroup),
      subsidiary: input.subsidiary,
      startDate: input.startDate,
      capital: input.capital ? input.capital : 0,
      rent: input.rent ? input.rent : 0,
      user: userSSO.preferredUsername
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'post',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      data: inputData
    };

    try {
      const response: AxiosResponse<HttpError> = await axiosBreaker.exec<HttpError>(axiosRequest);
      logResponse(response, urlApi, userSSO.transactionID);
      return httpErrorMinusConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }
}
