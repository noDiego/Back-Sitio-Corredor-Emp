import { Inject, Service } from 'typedi';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { URLS } from '../../constants/urls';
import breakerInstance from '../../utils/circuitBreaker/breakerInstance';
import { CircuitBreaker } from '../../utils/circuitBreaker/circuitBreaker';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { getVSHeaders } from '../../constants/headers';
import { logError, logResponse } from '../../utils/logutils';
import { buildPagedResponse, resolveError } from '../../utils/apiutils';
import { Logger } from '../../loaders/logger';
import { IClaimsAdapter } from '../../domain/interfaces/adapter/IClaimsAdapter';
import { IPrescription } from '../../domain/interfaces/dto/v3/IPrescription';
import { InsuredDeductible } from '../../domain/interfaces/dto/v3/IInsured';
import { InsuredDeductibleResponse } from './dto/insured';
import insuredDeductibleConverter from './converters/insuredDeductibleConverter';
import { PrescriptionResponse, Prescription } from './dto/prescriptions';
import prescriptionConverter from './converters/prescriptionConverter';
import moment from 'moment';
import Utils from '../../utils/utils';
import { Claim, ClaimsReponse } from './dto/claims';
import denounceConverter from './converters/denounceConverter';
import { IDenounce, IDenounceDetail, IDenounceServiceInput } from '../../domain/interfaces/dto/v3/IDenounce';
import { IPagedResponse } from '../../domain/interfaces/dto/v1/IResponse';
import { PaymentTypeResponse, PaymentTypeDetail } from './dto/paymentType';
import { IPaymentTypeDetail } from '../../domain/interfaces/dto/v3/IPaymentDetail';
import { HealthBeneficiary } from '../../domain/interfaces/dto/v3/IHealthBeneficiary';
import paymentDetailConverter from './converters/paymentDetailConverter';
import denounceDetailConverter from './converters/denounceDetailConverter';
import { ClaimsDetailResponse } from './dto/claimsDetails';
import { HealthBeneficiaryResponse } from './dto/healthBeneficiaries';
import { BackupDocumentsResponse, BackupDocument } from './dto/documents';
import { IDenounceFileRouteDTO } from '../../domain/interfaces/dto/v1/IDenounce';
import denounceDocumentConverter from './converters/denounceDocumentConverter';

@Service('ClaimsApi')
export default class ClaimsApi implements IClaimsAdapter {
  @Inject('logger') private readonly logger: Logger;

  async getPrescriptions(insuredRut: number, policyNumber: number, user: IUserSSO): Promise<IPrescription[]> {
    const serviceName = 'GetPrescriptions';
    const urlApi = `${URLS.claimsApi.getPrescriptions}${insuredRut}/prescriptions`;
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info(`Llamando a ${serviceName} con insuredRut: ${insuredRut} - policyNumber: ${policyNumber}`);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user),
      params: {
        PolicyNumber: policyNumber
      }
    };

    try {
      const response: AxiosResponse<PrescriptionResponse> = await axiosBreaker.exec<PrescriptionResponse>(
        axiosRequest,
        true
      );
      logResponse(response, urlApi, user.transactionID);
      const prescriptionList: IPrescription[] = [];
      response.data.prescriptions.forEach((prescription: Prescription) => {
        prescriptionList.push(prescriptionConverter(prescription));
      });
      return prescriptionList;
    } catch (error) {
      logError(error, urlApi);
      const response: IPrescription[] = resolveError(error, serviceName);
      return response ? response : [];
    }
  }

  async getInsuredDeductible(insuredRut: number, policyNumber: number, user: IUserSSO): Promise<InsuredDeductible[]> {
    this.logger.info(`Llamando a getInsuredDeductible con policyNumber: ${policyNumber} y insuredRut: ${insuredRut}`);
    const serviceName = 'InsuredDeductible';
    const urlApi: string = URLS.claimsApi.insured + insuredRut + '/deductibles';
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      PolicyNumber: policyNumber
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user),
      params: params
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<InsuredDeductibleResponse> = await axiosBreaker.exec<InsuredDeductibleResponse>(
        axiosRequest,
        true
      );
      logResponse(response, urlApi, user.transactionID);
      return insuredDeductibleConverter(response.data);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getDenouncesByCompanyAndInsured(
    input: IDenounceServiceInput,
    user: IUserSSO
  ): Promise<IPagedResponse<IDenounce>> {
    this.logger.info(
      `Llamando a getDenouncesByCompanyAndInsured con companyRut: ${input.companyRut} y insuredRut: ${input.insuredRut}`
    );
    const serviceName = 'DenouncesByCompanyAndInsured';
    const urlApi: string = URLS.claimsApi.insuranceCo + input.rutInsuranceCo + '/byCompanyAndInsured';
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = Utils.jsonClean({
      CompanyRut: input.companyRut,
      InsuredRut: input.insuredRut,
      User: input.userRut,
      Status: input.status,
      StarDate: moment(input.startDate).format('DD-MM-YYYY'),
      EndDate: moment(input.endDate).format('DD-MM-YYYY'),
      Page: input.page,
      Offset: input.limit
    });

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user),
      params: params
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<ClaimsReponse> = await axiosBreaker.exec<ClaimsReponse>(axiosRequest, true);
      logResponse(response, urlApi, user.transactionID);
      const responseList: IDenounce[] = [];
      response.data.claims.forEach((claim: Claim) => {
        responseList.push(denounceConverter(claim));
      });
      return buildPagedResponse<IDenounce>(
        responseList,
        input.page,
        input.limit,
        response.data.claims[0].pagination.quotaMax
      );
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getDenouncesByBrokerAndInsured(
    input: IDenounceServiceInput,
    user: IUserSSO
  ): Promise<IPagedResponse<IDenounce>> {
    this.logger.info(
      `Llamando a getDenouncesByBrokerAndInsured con brokerRut: ${input.brokerRut} y insuredRut: ${input.insuredRut}`
    );
    const serviceName = 'DenouncesByBrokerAndInsured';
    const urlApi: string = URLS.claimsApi.insuranceCo + input.rutInsuranceCo + '/byBrokerAndInsured';
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = Utils.jsonClean({
      BrokerRut: input.brokerRut,
      InsuredRut: input.insuredRut,
      User: input.userRut,
      Status: input.status,
      StarDate: moment(input.startDate).format('DD-MM-YYYY'),
      EndDate: moment(input.endDate).format('DD-MM-YYYY'),
      Page: input.page,
      Offset: input.limit
    });

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user),
      params: params
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<ClaimsReponse> = await axiosBreaker.exec<ClaimsReponse>(axiosRequest, true);
      logResponse(response, urlApi, user.transactionID);
      const responseList: IDenounce[] = [];
      response.data.claims.forEach((claim: Claim) => {
        responseList.push(denounceConverter(claim));
      });
      return buildPagedResponse<IDenounce>(
        responseList,
        input.page,
        input.limit,
        response.data.claims[0].pagination.quotaMax
      );
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getDenouncesByPolicy(input: IDenounceServiceInput, user: IUserSSO): Promise<IPagedResponse<IDenounce>> {
    this.logger.info(
      `Llamando a getDenouncesByPolicy con policyNumber: ${input.policyNumber} y insuredRut: ${input.insuredRut}`
    );
    const serviceName = 'DenouncesByPolicy';
    const urlApi: string = URLS.claimsApi.insuranceCo + input.rutInsuranceCo + '/byPolicy';
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = Utils.jsonClean({
      PolicyNumber: input.policyNumber,
      InsuredRut: input.insuredRut,
      Status: input.status,
      User: input.userRut,
      StarDate: moment(input.startDate).format('DD-MM-YYYY'),
      EndDate: moment(input.endDate).format('DD-MM-YYYY'),
      Page: input.page,
      Offset: input.limit
    });

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user),
      params: params
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<ClaimsReponse> = await axiosBreaker.exec<ClaimsReponse>(axiosRequest, true);
      logResponse(response, urlApi, user.transactionID);
      const responseList: IDenounce[] = [];
      response.data.claims.forEach((claim: Claim) => {
        responseList.push(denounceConverter(claim));
      });
      return buildPagedResponse<IDenounce>(
        responseList,
        input.page,
        input.limit,
        response.data.claims[0].pagination.quotaMax
      );
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getDenouncesByRemittanceId(
    rutInsuranceCo: number,
    remittanceId: string,
    page: number,
    limit: number,
    user: IUserSSO
  ): Promise<IPagedResponse<IDenounce>> {
    this.logger.info(`Llamando a getDenouncesByRemittanceId con remittanceId: ${remittanceId}`);
    const serviceName = 'DenouncesByRemittanceId';
    const urlApi: string = URLS.claimsApi.insuranceCo + rutInsuranceCo + '/remittance/' + remittanceId + '/request';
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = Utils.jsonClean({
      Page: page,
      Offset: limit
    });

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user),
      params: params
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<ClaimsReponse> = await axiosBreaker.exec<ClaimsReponse>(axiosRequest, true);
      logResponse(response, urlApi, user.transactionID);
      const responseList: IDenounce[] = [];
      response.data.claims.forEach((claim: Claim) => {
        responseList.push(denounceConverter(claim));
      });
      return buildPagedResponse<IDenounce>(responseList, page, limit, response.data.claims[0].pagination.quotaMax);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getClaimDetail(requestNumber: number, insuranceCo: number, user: IUserSSO): Promise<IDenounceDetail> {
    this.logger.info(`Llamando a claimDetail con requestNumber: ${requestNumber} y insuranceCo: ${insuranceCo}`);
    const serviceName = 'ClaimDetail';
    const urlApi: string = URLS.claimsApi.claimDetail + requestNumber + '/company/' + insuranceCo;
    this.logger.debug('URL Service: ' + urlApi);
    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user)
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<ClaimsDetailResponse> = await axiosBreaker.exec<ClaimsDetailResponse>(
        axiosRequest,
        true
      );
      logResponse(response, urlApi, user.transactionID);
      return denounceDetailConverter(response.data.claimsDetail[0]);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getPaymentDetails(policyNumber: number, user: IUserSSO): Promise<IPaymentTypeDetail[]> {
    this.logger.info(`Llamando a PaymentDetails con policyNumber: ${policyNumber}`);
    const serviceName = 'PaymentDetails';
    const urlApi: string = URLS.claimsApi.paymentType + policyNumber + '/paymentType';
    this.logger.debug('URL Service: ' + urlApi);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user)
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<PaymentTypeResponse> = await axiosBreaker.exec<PaymentTypeResponse>(
        axiosRequest,
        true
      );
      logResponse(response, urlApi, user.transactionID);
      const list: IPaymentTypeDetail[] = [];
      response.data.paymentTypeDetails.forEach((paymentDetail: PaymentTypeDetail) => {
        list.push(paymentDetailConverter(paymentDetail));
      });
      return list;
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getHealthBeneficiaries(
    insuredRut: number,
    policyNumber: number,
    insuranceCo: number,
    companyRut: number,
    brokerRut: number,
    remittanceType: string,
    user: IUserSSO
  ): Promise<HealthBeneficiary[]> {
    this.logger.info(
      `Llamando a getHealthBeneficiaries con insuredRut: ${insuredRut} y  policyNumber: ${policyNumber}`
    );
    const serviceName = 'HealthBeneficiaries';
    const urlApi: string = URLS.claimsApi.insuranceCo + insuranceCo + '/insured/' + insuredRut + '/healthBeneficiaries';
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = Utils.jsonClean({
      PolicyNumber: policyNumber,
      CompanyRut: companyRut,
      BrokerRut: brokerRut,
      RemittanceType: remittanceType
    });

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user),
      params: params
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<HealthBeneficiaryResponse> = await axiosBreaker.exec<HealthBeneficiaryResponse>(
        axiosRequest,
        true
      );
      logResponse(response, urlApi, user.transactionID);
      return response.data.healthBeneficiaries;
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getBackupDocs(nsolicitud: number, user: IUserSSO): Promise<IDenounceFileRouteDTO[]> {
    this.logger.info(`Llamando a getBackupDocs con nsolicitud: ${nsolicitud}`);
    const serviceName = 'BackupDocs';
    const urlApi: string = URLS.gestorDocumental.links;
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      Empresa: 'VIDA SECURITY',
      Archivador: 'Seguros Colectivos',
      RUTEMPRESA: Utils.RUTINSURANCECO,
      NSOLICITUD: nsolicitud
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(user),
      params: params
    };

    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    try {
      const response: AxiosResponse<BackupDocumentsResponse> = await axiosBreaker.exec<BackupDocumentsResponse>(
        axiosRequest,
        true
      );
      logResponse(response, urlApi, user.transactionID);

      const documentList: IDenounceFileRouteDTO[] = [];
      if (response.data && response.data.Documentos) {
        for (let i = 0; i < response.data.Documentos.length; i++) {
          const document: BackupDocument = response.data.Documentos[i];
          const fileData: IDenounceFileRouteDTO = denounceDocumentConverter(document);
          fileData.name = `Document-${nsolicitud}-${i + 1}`;
          documentList.push(fileData);
        }
      }
      return documentList;
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }
}
