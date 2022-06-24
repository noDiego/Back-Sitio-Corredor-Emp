import * as exceljs from 'exceljs';
import moment from 'moment';
import rutjs from 'rut.js';
import { Inject, Service } from 'typedi';
import config from '../../config';
import { DENOUNCE_APPLICATION_STATUS, DENOUNCE_FILE_STATUS, DENOUNCE_STATUS } from '../../constants/status';
import Utils from '../../utils/utils';
import {
  IDenounceDTO,
  IDenounceFileRouteDTO,
  IDenounceSearchRequestDTO
} from '../../domain/interfaces/dto/v1/IDenounce';
import {
  IDenounceAppBeneficiaryDTO,
  IDenounceAppForm,
  IDenounceApplicationDTO,
  IDenounceAppPolicyDTO,
  IDenouncePolicyDataV1
} from '../../domain/interfaces/dto/v1/IDenounceApplication';
import { IDenounceFileDTO } from '../../domain/interfaces/dto/v1/IDenounceFile';
import { IError } from '../../utils/interfaces/IError';
import { IResponseDTO } from '../../utils/interfaces/IResponse';
import AzureBusClient from '../../infrastructure/clients/azureBusClient';
import AdministrationRepository from '../../infrastructure/database/administrationRepository';
import DenounceRepository from '../../infrastructure/database/denounceRepository';
import AzureStorageRepository from '../../infrastructure/repositories/azureStorageRepository';
import { IDenounceService } from '../../domain/interfaces/services/IDenounceService';
import ClaimsApi from '../../infrastructure/clients/claimsApi';
import { IDenounce, IDenounceDetail, IDenounceServiceInput } from '../../domain/interfaces/dto/v3/IDenounce';
import { IPagedResponse } from '../../domain/interfaces/dto/v1/IResponse';
import denounceV1Converter from '../../domain/interfaces/dto/v1/converter/denounceV1Converter';
import { IBenefitDTO } from '../../domain/interfaces/dto/v1/IBenefit';
import { IPaymentTypeDetail } from '../../domain/interfaces/dto/v3/IPaymentDetail';
import { IPaymentV1 } from '../../domain/interfaces/dto/v1/IPayment';
import paymentV1Converter from '../../domain/interfaces/dto/v1/converter/paymentV1Converter';
import { IInsured } from '../../domain/interfaces/dto/v3/IInsured';
import PolicyApi from '../../infrastructure/clients/policyApi';
import { ClaimType, HealthBeneficiary } from '../../domain/interfaces/dto/v3/IHealthBeneficiary';
import { IPolicy } from '../../domain/interfaces/dto/v3/IPolicy';
import PolicyService from './policyService';
import { rutCreate } from '../../utils/validators';
import { ClientType } from '../../constants/types';
import { IValueObjectV1 } from '../../domain/interfaces/dto/v1/IValueObject';
import { IClientDTO } from '../../domain/interfaces/dto/administration/IClientDTO';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { IUserDTO } from '../../domain/interfaces/dto/administration/IUserDTO';
import { Logger } from '../../loaders/logger';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { DenounceApplication as DenounceEntity } from '../../infrastructure/database/entities/denounceApplication';
import { DenounceFile } from '../../infrastructure/database/entities/denounceFile';
import { Workbook, Worksheet } from 'exceljs';

@Service('DenounceService')
export default class DenounceService implements IDenounceService {
  @Inject('logger') private readonly logger: Logger;
  @Inject('AdministrationRepository') private readonly databaseService: AdministrationRepository;
  @Inject('DenounceRepository') private readonly denounceRepository: DenounceRepository;
  @Inject('AzureBusClient') private readonly serviceBusService: AzureBusClient;
  @Inject('AzureStorageRepository') private readonly storageRepository: AzureStorageRepository;
  @Inject('ClaimsApi') private readonly claimsApi: ClaimsApi;
  @Inject('PolicyApi') private readonly policyApi: PolicyApi;
  @Inject('PolicyService') private readonly policyService: PolicyService;

  async searchInsuredDenounces(
    policy: number,
    insuredRut: string,
    monthRangeDate: number,
    page: number,
    limit: number,
    user: IUserSSO
  ): Promise<IResponseDTO> {
    const listaDenuncio: IDenounceDTO[] = [];
    try {
      const monthQuantity: number = monthRangeDate;
      const today: Date = new Date();
      const monthsAgoDate: Date = moment().subtract(monthQuantity, 'months').toDate();

      const insuredRutNumber: number = Utils.getRutNumber(insuredRut);
      const denouncesByPolicyInput: IDenounceServiceInput = {
        startDate: monthsAgoDate,
        endDate: today,
        insuredRut: insuredRutNumber,
        limit: limit,
        page: page,
        policyNumber: policy,
        rutInsuranceCo: Utils.RUTINSURANCECONUMBER
      };
      const listaDenuncioResponse: IPagedResponse<IDenounce> = await this.claimsApi.getDenouncesByPolicy(
        denouncesByPolicyInput,
        user
      );
      if (listaDenuncioResponse) {
        listaDenuncioResponse.data.forEach((denounce: IDenounce) => {
          listaDenuncio.push(denounceV1Converter(denounce));
        });
      }
      return {
        code: listaDenuncio.length > 0 ? 0 : 1,
        message: listaDenuncio.length > 0 ? 'OK' : 'SIN DATOS',
        data: listaDenuncio,
        page: page,
        limit: limit,
        totalPage: listaDenuncioResponse ? listaDenuncioResponse.totalPage : 1,
        recordTotal: listaDenuncioResponse ? listaDenuncioResponse.recordTotal : listaDenuncio.length
      };
    } catch (e) {
      throw e;
    }
  }

  async findDenounce(requestNumber: number, user: IUserSSO): Promise<IDenounceDTO> {
    const insuranceCoNumber: number = Utils.getRutNumber(Utils.RUTINSURANCECO);
    try {
      const detail: IDenounceDetail = await this.claimsApi.getClaimDetail(requestNumber, insuranceCoNumber, user);
      const denounceV1: IDenounceDTO = denounceV1Converter(
        detail.denounce,
        detail.paymentType,
        detail.benefits,
        detail.deductibles
      );
      denounceV1.totalBenefits =
        denounceV1.benefits && denounceV1.benefits.length > 0 ? this.calculateBenefits(denounceV1.benefits) : null;
      return denounceV1;
    } catch (e) {
      throw e;
    }
  }

  async getDenounceApplicationForm(insuredRut: string, policyNumber: number, user: IUserSSO): Promise<IResponseDTO> {
    try {
      let insuredData: IInsured;
      let listHealthData: HealthBeneficiary[] = [];
      const insuredRutNumber: number = Utils.getRutNumber(insuredRut);
      const insuranceCo: number = Utils.getRutNumber(Utils.RUTINSURANCECO);
      const userData: IUserDTO = await this.databaseService.getUserData(user.preferredUsername);
      const client: IClientDTO = userData.clients[0];
      //busqueda por rut
      if (!policyNumber) {
        //validacion que existe en la cartera
        let policiesResponse: IPagedResponse<IPolicy>;
        let policiesList: IPolicy[] = [];
        const userPoliciesList: IPolicy[] = [];
        let pageService = 1;
        let totalPages: number;
        do {
          policiesResponse = await this.policyApi.getPoliciesByInsured(
            insuredRutNumber,
            insuranceCo,
            pageService,
            config.VSQueryLimit,
            user
          );
          policiesList = policiesList.concat(policiesResponse.data);
          totalPages = policiesResponse.totalPage;
          pageService++;
        } while (pageService <= totalPages);

        if (policiesList.length == 0)
          return {
            code: 1,
            message: 'Asegurado no existe, o no es de la cartera del usuario',
            data: null
          };
        const policyUserList: number[] = await this.policyService.getUserPoliciesList(user);

        for (const policyNumber of policyUserList) {
          const policyData: IPolicy = policiesList.find(
            (p: IPolicy) => p.policyNumber == policyNumber && p.hasHealthBenefits
          );
          if (policyData) userPoliciesList.push(policyData);
        }

        if (userPoliciesList.length == 0)
          return {
            code: 1,
            message: 'El rut ingresado no posee polizas validas para realizar denuncio',
            data: null
          };

        //Me traigo la info personal del asegurado
        insuredData = await this.policyApi.getInsuredDetail(userPoliciesList[0].policyNumber, insuredRutNumber, user);
        insuredData.policies = userPoliciesList;

        //me traigo la lista de beneficiarios, para ese rut de asegurado
        let insuredHealthDataList: HealthBeneficiary[] = [];
        if (client.type == ClientType.COMPANY) {
          insuredHealthDataList = await this.claimsApi.getHealthBeneficiaries(
            insuredRutNumber,
            null,
            insuranceCo,
            null,
            null,
            null,
            user
          );
        }
        if (client.type == ClientType.BROKER) {
          insuredHealthDataList = await this.claimsApi.getHealthBeneficiaries(
            insuredRutNumber,
            null,
            insuranceCo,
            null,
            null,
            null,
            user
          );
        }

        //Se valida que los datos para realizar el denuncio vengan con polizas que pertenecen al usuario
        if (insuredHealthDataList && insuredHealthDataList.length > 0) {
          for (const insuredHealthData of insuredHealthDataList) {
            const policyDataHealth: IPolicy = userPoliciesList.find(
              (p: IPolicy) => p.policyNumber == insuredHealthData.policy.policyNumber
            );
            if (policyDataHealth) listHealthData.push(insuredHealthData);
          }
        }

        if (listHealthData.length < 1) {
          return {
            code: 1,
            message: 'El rut ingresado no posee polizas validas para realizar denuncio',
            data: null
          };
        }
        //busqueda por poliza
      } else {
        insuredData = await this.policyApi.getInsuredDetail(policyNumber, insuredRutNumber, user);
        if (!insuredData) {
          return {
            code: 1,
            message: 'Asegurado no existe, o no es de la cartera del usuario',
            data: null
          };
        }

        const insuredHealthData: HealthBeneficiary[] = await this.claimsApi.getHealthBeneficiaries(
          insuredRutNumber,
          policyNumber,
          insuranceCo,
          null,
          null,
          null,
          user
        );
        listHealthData = insuredHealthData;
      }

      if (listHealthData.length < 1) {
        return {
          code: 1,
          message: 'Asegurado no tiene data de beneficiarios de salud',
          data: null
        };
      }

      const denuncioForm: IDenounceAppForm[] = this.groupFormCreateDenounce(listHealthData);

      const denounceApp: IDenounceApplicationDTO = {
        insuredRut: rutjs.format(insuredRut),
        insuredName: insuredData.firstName,
        insuredLastname: insuredData.lastName,
        insuredEmail:
          policyNumber && insuredData.contactInfo && insuredData.contactInfo.emailAddress
            ? insuredData.contactInfo.emailAddress
            : '',
        status: DENOUNCE_APPLICATION_STATUS.PROSPECTO.toString(),
        userRut: user.preferredUsername,
        userEmail: user.email,
        userName: user.givenName + ' ' + user.familyName,
        creationDate: new Date(),
        policy: policyNumber
      };
      const denounceSaved: IDenounceApplicationDTO = await this.denounceRepository.insertDenounce(denounceApp);
      denounceSaved.denounceForm = denuncioForm;
      return {
        code: 0,
        message: 'OK',
        data: denounceSaved
      };
    } catch (e) {
      throw e;
    }
  }
  private groupFormCreateDenounce(listHealthData: HealthBeneficiary[]): IDenounceAppForm[] {
    try {
      const typeHash: Map<string, IDenounceAppForm> = new Map();
      listHealthData.forEach((den: HealthBeneficiary) => {
        den.planBeneficiaries.claimTypes.forEach((claimTypes: ClaimType) => {
          if (typeHash) {
            if (typeHash.get(claimTypes.code)) {
              const data: IDenounceAppForm = typeHash.get(claimTypes.code);

              const plansObject: IDenounceAppPolicyDTO = {
                planCode: String(den.planBeneficiaries.code),
                planName: den.planBeneficiaries.name,
                policyCode: String(den.policy.renewalIdtrassa),
                policyNumber: String(den.policy.policyNumber)
              };
              this.groupBeneficiaries(
                data.beneficiaries,
                plansObject,
                rutCreate(den.beneficiary.rut, den.beneficiary.dv),
                den.beneficiary.name
              );
            } else {
              const data: IDenounceAppForm = {
                denounceType: claimTypes.name,
                denounceTypeCode: claimTypes.code,
                beneficiaries: []
              };

              const plansObject: IDenounceAppPolicyDTO = {
                planCode: String(den.planBeneficiaries.code),
                planName: den.planBeneficiaries.name,
                policyCode: String(den.policy.renewalIdtrassa),
                policyNumber: String(den.policy.policyNumber)
              };

              this.groupBeneficiaries(
                data.beneficiaries,
                plansObject,
                rutCreate(den.beneficiary.rut, den.beneficiary.dv),
                den.beneficiary.name
              );

              typeHash.set(claimTypes.code, data);
            }
          }
        });
      });

      return Array.from(typeHash.values());
    } catch (e) {
      throw new Error('Error al leer dummy de denounce.json. Error: ' + e.message);
    }
  }

  private groupBeneficiaries(
    dependantArray: Array<IDenounceAppBeneficiaryDTO>,
    plansObject: IDenounceAppPolicyDTO,
    beneficiaryRut: string,
    beneficiaryNombre: string
  ): Array<IDenounceAppBeneficiaryDTO> {
    if (dependantArray.find((x: IDenounceAppBeneficiaryDTO) => x.dependentRut === beneficiaryRut)) {
      dependantArray.find((x: IDenounceAppBeneficiaryDTO) => x.dependentRut === beneficiaryRut).plans.push(plansObject);
    } else {
      const dependantObject: IDenounceAppBeneficiaryDTO = {
        dependentRut: beneficiaryRut,
        dependentName: beneficiaryNombre,
        plans: []
      };
      dependantObject.plans.push(plansObject);
      dependantArray.push(dependantObject);
    }
    return dependantArray;
  }

  async deleteDenounceApplication(id: number, rutUser: string): Promise<IResponseDTO> {
    try {
      this.logger.info('Ingreso a servicio de eliminacion de denuncio,  id : ' + id);
      const denounceFileList: IDenounceFileDTO[] = await this.denounceRepository.getFileList(id);
      if (denounceFileList.length > 0) {
        for (const file of denounceFileList) {
          this.logger.info(
            'Llamando a servicio de eliminacion de archivo de denuncio azure blob,  fileid : ' + file.id
          );
          const responseStorage: IResponseDTO = await this.storageRepository.deleteFile(
            file,
            rutUser,
            config.denounceAppContainer
          );
          this.logger.info(
            'Eliminacion  correcta en storage de denuncio,  id : ' + id + ' respuesta:' + responseStorage
          );
        }
      }
      this.logger.info('Llamando a servicio de eliminacion de denuncio,  id : ' + id);
      return this.denounceRepository.deleteDenounceById(id);
    } catch (e) {
      this.logger.error('Error al servicio de eliminacion de denuncio  id : ' + id + ' error: ' + e.message);
      throw new Error('Error al eliminar datos de Solicitud de Denuncio en BD. Error: ' + e.message);
    }
  }

  async createDenounceApplication(
    inputData: IDenounceApplicationDTO,
    user: IUserSSO
  ): Promise<IDenounceApplicationDTO> {
    try {
      inputData.creationDate = new Date();
      inputData.status = DENOUNCE_APPLICATION_STATUS.EN_PROCESO;
      inputData.renovation = Utils.getRandomInt(1, 6);

      const changedParametersDenounce: QueryDeepPartialEntity<DenounceEntity> = {
        //Parametros a actualizar en Denounce
        creationDate: inputData.creationDate,
        status: inputData.status,
        renovation: inputData.renovation,
        amount: inputData.amount,
        beneficiaryName: inputData.beneficiaryName,
        beneficiaryRut: inputData.beneficiaryRut,
        comment: inputData.comment,
        denounceType: inputData.denounceType,
        denounceTypeCode: inputData.denounceTypeCode,
        insuredRut: rutjs.format(inputData.insuredRut),
        plan: inputData.plan,
        planCode: inputData.planCode,
        groupCode: inputData.groupCode ? inputData.groupCode : String(inputData.id),
        policy: inputData.policy,
        paymentId: inputData.paymentId ? inputData.paymentId : 0
      };

      const changedParametersFile: QueryDeepPartialEntity<DenounceFile> = {
        //Parametros a actualizar en File
        creationDate: inputData.creationDate,
        status: DENOUNCE_FILE_STATUS.EN_PROCESO
      };

      const updateDenounceResp: IResponseDTO = await this.denounceRepository.updateDenounce(
        inputData.id,
        changedParametersDenounce
      );
      const updateFileResp: IResponseDTO = await this.denounceRepository.updateFiles(
        inputData.id,
        changedParametersFile
      );

      if (updateFileResp.code != 0 || updateDenounceResp.code != 0) {
        throw new IError('Error al actualizar estado de denuncio', 'DatabaseError', 1);
      }

      if (String(inputData.id) == inputData.groupCode) {
        const queueJob: boolean = await this.callQueue(inputData.groupCode, user);

        if (queueJob) {
          throw new IError('Error al crear la cola de denuncio', 'AzureError', 1);
        }
      }

      return await this.denounceRepository.getDenounceApp(inputData.id);
    } catch (e) {
      throw e;
    }
  }

  // public async getDenouncesApplications(): Promise<IDenounceApplicationDTO[]> {
  //   try {
  //     return this.denounceRepository.getAllDenounces();
  //   } catch (e) {
  //     throw new Error('Error al leer datos de denounces App en BD. Error: ' + e.message);
  //   }
  // }

  async createDenounceFile(inputData: IDenounceFileDTO): Promise<IResponseDTO> {
    try {
      inputData.status = DENOUNCE_FILE_STATUS.PROSPECTO;
      inputData.creationDate = new Date();
      const file: IDenounceFileDTO = await this.denounceRepository.insertFile(inputData);

      return {
        code: 0,
        message: 'OK',
        data: file
      };
    } catch (e) {
      throw e;
    }
  }

  async searchDenounces(user: IUserSSO, data: string, paramsRequest: IDenounceSearchRequestDTO): Promise<IResponseDTO> {
    const listaDenuncio: IDenounceDTO[] = [];
    try {
      let today: Date;
      let daysAgoDate: Date;
      const userData: IUserDTO = await this.databaseService.getUserData(user.preferredUsername);
      const client: IClientDTO = userData.clients[0];
      const policyUserList: number[] = await this.policyService.getUserPoliciesList(user);
      if (paramsRequest.codeDate) {
        today = new Date();
        daysAgoDate = moment().subtract(paramsRequest.codeDate, 'days').toDate();
      }

      if (data) {
        if (Utils.isNumeric(data)) {
          const requestIdClaims: IDenounceDetail = await this.claimsApi.getClaimDetail(
            +data,
            Utils.getRutNumber(Utils.RUTINSURANCECO),
            user
          );
          if (requestIdClaims) {
            const policyData: number = policyUserList.find((p: number) => p == requestIdClaims.denounce.policy);
            if (policyData) listaDenuncio.push(denounceV1Converter(requestIdClaims.denounce));
          }
        }
        const remittanceIdClaims: IPagedResponse<IDenounce> = await this.claimsApi.getDenouncesByRemittanceId(
          Utils.getRutNumber(Utils.RUTINSURANCECO),
          data,
          1,
          config.VSQueryLimit,
          user
        );

        if (remittanceIdClaims && remittanceIdClaims.data.length > 0) {
          remittanceIdClaims.data.forEach((denounce: IDenounce) => {
            const policyData: number = policyUserList.find((p: number) => p == denounce.policy);
            if (policyData) listaDenuncio.push(denounceV1Converter(denounce));
          });
        }
      } else {
        await this.advanceDenounceSearch(
          paramsRequest,
          user,
          policyUserList,
          listaDenuncio,
          daysAgoDate,
          today,
          client
        );
      }

      const startIndex: number = (paramsRequest.page - 1) * paramsRequest.limit;
      const endIndex: number = paramsRequest.page * paramsRequest.limit;
      const recordTotal: number = listaDenuncio ? listaDenuncio.length : 0;
      const totalPage: number = Math.ceil(recordTotal / paramsRequest.limit);

      const result: IDenounceDTO[] = listaDenuncio.slice(startIndex, endIndex);

      return {
        code: listaDenuncio.length > 0 ? 0 : 1,
        message: listaDenuncio.length > 0 ? 'OK' : 'SIN DATOS',
        data: result,
        page: paramsRequest.page,
        limit: paramsRequest.limit,
        totalPage: totalPage,
        recordTotal: recordTotal
      };
    } catch (e) {
      throw e;
    }
  }

  private async advanceDenounceSearch(
    paramsRequest: IDenounceSearchRequestDTO,
    user: IUserSSO,
    policyUserList: number[],
    listaDenuncio: IDenounceDTO[],
    daysAgoDate: Date,
    today: Date,
    client: IClientDTO
  ): Promise<void> {
    if (
      paramsRequest.applicationNumber ||
      paramsRequest.consignment ||
      paramsRequest.policy ||
      paramsRequest.insuredRut ||
      paramsRequest.contractorRut
    ) {
      if (paramsRequest.applicationNumber) {
        const requestIdClaims: IDenounceDetail = await this.claimsApi.getClaimDetail(
          paramsRequest.applicationNumber,
          Utils.getRutNumber(Utils.RUTINSURANCECO),
          user
        );
        if (requestIdClaims) {
          const policyData: number = policyUserList.find((p: number) => p == requestIdClaims.denounce.policy);
          if (policyData) listaDenuncio.push(denounceV1Converter(requestIdClaims.denounce));
        }
        return;
      }
      if (paramsRequest.consignment) {
        const remittanceIdClaims: IPagedResponse<IDenounce> = await this.claimsApi.getDenouncesByRemittanceId(
          Utils.getRutNumber(Utils.RUTINSURANCECO),
          paramsRequest.consignment,
          1,
          config.VSQueryLimit,
          user
        );
        if (remittanceIdClaims && remittanceIdClaims.data.length > 0) {
          remittanceIdClaims.data.forEach((denounce: IDenounce) => {
            const policyData: number = policyUserList.find((p: number) => p == denounce.policy);
            if (policyData) listaDenuncio.push(denounceV1Converter(denounce));
          });
        }
        return;
      }
      if (paramsRequest.policy) {
        const denouncesByPolicyInput: IDenounceServiceInput = {
          rutInsuranceCo: Utils.RUTINSURANCECONUMBER,
          startDate: daysAgoDate,
          endDate: today,
          status: paramsRequest.status ? Utils.getMapKeyByValue(DENOUNCE_STATUS, paramsRequest.status) : null,
          userRut: paramsRequest.onlyMine ? user.preferredUsername : null,
          page: 1,
          limit: config.VSQueryLimit
        };
        const listaDenuncioResponse: IPagedResponse<IDenounce> = await this.claimsApi.getDenouncesByPolicy(
          denouncesByPolicyInput,
          user
        );
        if (listaDenuncioResponse && listaDenuncioResponse.data.length > 0) {
          listaDenuncioResponse.data.forEach((denounce: IDenounce) => {
            listaDenuncio.push(denounceV1Converter(denounce));
          });
        }
        return;
      }
      if (paramsRequest.insuredRut) {
        if (client.type == ClientType.COMPANY) {
          const denouncesByPolicyInput: IDenounceServiceInput = {
            rutInsuranceCo: Utils.RUTINSURANCECONUMBER,
            companyRut: Utils.getRutNumber(client.rut),
            insuredRut: Utils.getRutNumber(paramsRequest.insuredRut),
            startDate: daysAgoDate,
            endDate: today,
            status: paramsRequest.status ? Utils.getMapKeyByValue(DENOUNCE_STATUS, paramsRequest.status) : null,
            userRut: paramsRequest.onlyMine ? user.preferredUsername : null,
            page: 1,
            limit: config.VSQueryLimit
          };

          const listaDenuncioResponse: IPagedResponse<IDenounce> = await this.claimsApi.getDenouncesByCompanyAndInsured(
            denouncesByPolicyInput,
            user
          );
          if (listaDenuncioResponse && listaDenuncioResponse.data.length > 0) {
            listaDenuncioResponse.data.forEach((denounce: IDenounce) => {
              const policyData: number = policyUserList.find((p: number) => p == denounce.policy);
              if (policyData) listaDenuncio.push(denounceV1Converter(denounce));
            });
          }
          return;
        }
        if (client.type == ClientType.BROKER) {
          const denouncesByPolicyInput: IDenounceServiceInput = {
            rutInsuranceCo: Utils.RUTINSURANCECONUMBER,
            companyRut: Utils.getRutNumber(client.rut),
            insuredRut: Utils.getRutNumber(paramsRequest.insuredRut),
            userRut: paramsRequest.onlyMine ? user.preferredUsername : null,
            startDate: daysAgoDate,
            endDate: today,
            status: paramsRequest.status ? Utils.getMapKeyByValue(DENOUNCE_STATUS, paramsRequest.status) : null,
            page: 1,
            limit: config.VSQueryLimit
          };

          const listaDenuncioResponse: IPagedResponse<IDenounce> = await this.claimsApi.getDenouncesByBrokerAndInsured(
            denouncesByPolicyInput,
            user
          );
          if (listaDenuncioResponse && listaDenuncioResponse.data.length > 0) {
            listaDenuncioResponse.data.forEach((denounce: IDenounce) => {
              const policyData: number = policyUserList.find((p: number) => p == denounce.policy);
              if (policyData) listaDenuncio.push(denounceV1Converter(denounce));
            });
          }
          return;
        }
      }
      if (paramsRequest.contractorRut) {
        const denouncesByPolicyInput: IDenounceServiceInput = {
          rutInsuranceCo: Utils.RUTINSURANCECONUMBER,
          companyRut: Utils.getRutNumber(paramsRequest.contractorRut),
          userRut: paramsRequest.onlyMine ? user.preferredUsername : null,
          startDate: daysAgoDate,
          endDate: today,
          status: paramsRequest.status ? Utils.getMapKeyByValue(DENOUNCE_STATUS, paramsRequest.status) : null,
          page: 1,
          limit: config.VSQueryLimit
        };

        const listaDenuncioResponse: IPagedResponse<IDenounce> = await this.claimsApi.getDenouncesByCompanyAndInsured(
          denouncesByPolicyInput,
          user
        );
        if (listaDenuncioResponse && listaDenuncioResponse.data.length > 0) {
          listaDenuncioResponse.data.forEach((denounce: IDenounce) => {
            const policyData: number = policyUserList.find((p: number) => p == denounce.policy);
            if (policyData) listaDenuncio.push(denounceV1Converter(denounce));
          });
        }
        return;
      }
    } else {
      //VER que servicio tengo que llamar
    }
  }

  async generateXLSDenounce(user: IUserSSO, paramsRequest: IDenounceSearchRequestDTO): Promise<exceljs.Buffer> {
    const workbook: Workbook = new exceljs.Workbook();
    const listaDenuncio: IDenounceDTO[] = [];
    let today: Date;
    let daysAgoDate: Date;
    const userData: IUserDTO = await this.databaseService.getUserData(user.preferredUsername);
    const client: IClientDTO = userData.clients[0];
    const policyUserList: number[] = await this.policyService.getUserPoliciesList(user);
    if (paramsRequest.codeDate) {
      today = new Date();
      daysAgoDate = moment().subtract(paramsRequest.codeDate, 'days').toDate();
    }
    await this.advanceDenounceSearch(paramsRequest, user, policyUserList, listaDenuncio, daysAgoDate, today, client);
    workbook.creator = 'VidaSecurity';
    workbook.modified = new Date();
    const sheet: Worksheet = workbook.addWorksheet('Denuncios');
    sheet.columns = [
      { header: 'Numero de solicitud', width: 20 },
      { header: 'Numero de remesa', width: 20 },
      { header: 'Rut de asegurado', width: 20 },
      { header: 'Nombre asegurado', width: 25 },
      { header: 'Rut de Beneficiario', width: 20 },
      { header: 'Nombre de Beneficiario', width: 25 },
      { header: 'Póliza', width: 13 },
      { header: 'Nombre Empresa', width: 18 },
      { header: 'Fecha de denuncio', width: 18 },
      { header: 'Fecha de Liquidación', width: 20 },
      { header: 'Monto Reclamado', width: 18 },
      { header: 'Monto Liquidado', width: 18 },
      { header: 'Estado del Denuncio', width: 20 }
    ];
    for (let i = 0; i < listaDenuncio.length; i++) {
      sheet.insertRow(i + 2, [
        listaDenuncio[i].applicationNumber,
        listaDenuncio[i].consignment,
        listaDenuncio[i].insured.code,
        listaDenuncio[i].insured.name,
        listaDenuncio[i].beneficiary.code,
        listaDenuncio[i].beneficiary.name,
        listaDenuncio[i].policy,
        listaDenuncio[i].company.name,
        moment(listaDenuncio[i].denounceDate).format('L'),
        moment(listaDenuncio[i].liquidationDate).format('L'),
        listaDenuncio[i].amountClaim,
        listaDenuncio[i].amountPay,
        listaDenuncio[i].status
      ]);
    }

    return await workbook.xlsx.writeBuffer();
  }

  async createDenounceApplicationList(
    inputList: IDenounceApplicationDTO[],
    user: IUserSSO
  ): Promise<IDenounceApplicationDTO[]> {
    const denounceApplicationList: IDenounceApplicationDTO[] = [];
    this.logger.info(
      'Llamando a servicio de creacion de lista denuncio, cantidad de denuncios a crear : ' + inputList.length
    );
    if (inputList.length > 0) {
      const currentDate: string = moment(new Date()).format('YYYYMMDDmm');
      const groupCode: string = currentDate + inputList[0].policy + '' + inputList.length;

      for (const denounce of inputList) {
        denounce.groupCode = groupCode;
        denounce.userRut = user.preferredUsername;
        const updatedDenounce: IDenounceApplicationDTO = await this.createDenounceApplication(denounce, user);
        denounceApplicationList.push(updatedDenounce);
      }
      const queueJob: boolean = await this.callQueue(groupCode, user);

      if (queueJob) {
        this.logger.error('Error al crear la cola de denuncio para codeGroup:' + groupCode);
        throw new IError('Error al crear la cola de denuncio para codeGroup:' + groupCode, 'AzureError', 1);
      }
    }
    this.logger.info(
      'Retorno de servicio de creacion de lista denuncio, cantidad creadas : ' + denounceApplicationList.length
    );
    return denounceApplicationList;
  }

  async deleteDenounceApplicationList(inputList: number[], rutUser: string): Promise<IResponseDTO> {
    try {
      const result: Array<any> = [];
      this.logger.info(
        'Llamando a servicio de eliminacion de lista denuncio, cantidad de denuncios a eliminar : ' + inputList.length
      );
      for (const id of inputList) {
        const resultDelete: IResponseDTO = await this.deleteDenounceApplication(id, rutUser);
        if (resultDelete.code == 0) {
          result.push({ id: id, message: 'OK' });
        } else {
          result.push({ id: id, message: 'NOTOK' });
        }
      }
      this.logger.info(
        'Finalizacion servicio de eliminacion de lista denuncio, cantidad de denuncios a eliminar : ' + inputList.length
      );
      return {
        code: 0,
        message: 'OK',
        data: result
      };
    } catch (e) {
      this.logger.error('Excepcion servicio de eliminacion de lista denuncio, error:' + e.message);
      throw e;
    }
  }

  async findDenounceFiles(applicationNumber: number, user: IUserSSO): Promise<IResponseDTO> {
    try {
      this.logger.info(
        'Llamando a servicio de obtencion de lista de archivos de denuncio, denuncio: ' + applicationNumber
      );
      const denounceFiles: IDenounceFileRouteDTO[] = await this.claimsApi.getBackupDocs(applicationNumber, user);

      this.logger.info(
        'Finalizacion servicio de obtencion de lista de archivos de denuncio, cantidad de archivos denuncios : ' +
          denounceFiles
          ? denounceFiles.length
          : 0
      );
      return {
        code: 0,
        message: 'OK',
        data: denounceFiles
      };
    } catch (e) {
      this.logger.error('Excepcion servicio de obtencion de lista de archivos de denuncio, error:' + e.message);
      throw e;
    }
  }

  private async callQueue(groupCode: string, userSSO: IUserSSO): Promise<boolean> {
    const userData: IUserDTO = await this.databaseService.getUserData(userSSO.preferredUsername);
    userData.ssoData = userSSO;
    delete userData.ssoData.authorizationToken;

    this.logger.info('Llamando a cola de denuncio callQueue para denuncio(s) codigo de grupo: ' + groupCode);
    const body: string = JSON.stringify({
      idDenounceApp: groupCode,
      userData: userData
    });
    const label = 'Denounce Application Queue';

    const queueJob: boolean = await this.serviceBusService.sendMessageQueue(
      userSSO.preferredUsername,
      config.denounceServiceBusQueueName,
      body,
      label,
      null
    );

    this.logger.info(
      'Respuesta erronea (' + queueJob + ') a cola de denuncio callQueue para denuncio(s) codigo de grupo: ' + groupCode
    );
    return queueJob;
  }

  async getPolicyPaymentDetail(policyNumber: number, user: IUserSSO): Promise<IResponseDTO> {
    try {
      this.logger.info('getPolicyPaymentDetail - input numero de poliza : ' + policyNumber);
      const paymentTypeList: IPaymentTypeDetail[] = await this.claimsApi.getPaymentDetails(policyNumber, user);

      const accountList: IPaymentV1[] = [];
      if (paymentTypeList) {
        paymentTypeList.forEach((paymentDetail: IPaymentTypeDetail) => {
          accountList.push(paymentV1Converter(paymentDetail));
        });
      }

      this.logger.info(
        'getPolicyPaymentDetail - cantidad detalles de pagos encontrados para poliza(' +
          policyNumber +
          '): ' +
          accountList.length
      );
      let insuredList: IInsured[] = [];
      let pageService = 1;
      let totalPages: number;
      do {
        const insuredResponseList: IPagedResponse<IInsured> = await this.policyApi.getInsuredsByPolicy(
          policyNumber,
          pageService,
          config.VSQueryLimit,
          user
        );
        insuredList = insuredList.concat(insuredResponseList.data);
        totalPages = insuredResponseList.totalPage;
        pageService++;
      } while (pageService <= totalPages);

      const insureds: IValueObjectV1[] = [];
      insuredList.forEach((insured: IInsured) => {
        insureds.push({ code: insured.rut, name: insured.rut });
      });

      const sortedInsured: IValueObjectV1[] = insureds.sort((n1: IValueObjectV1, n2: IValueObjectV1) => {
        if (Utils.getRutNumber(n1.code) > Utils.getRutNumber(n2.code)) {
          return 1;
        }

        if (Utils.getRutNumber(n1.code) < Utils.getRutNumber(n2.code)) {
          return -1;
        }

        return 0;
      });

      const policyDataResult: IDenouncePolicyDataV1 = {
        insureds: sortedInsured,
        companyPaymentMode: paymentTypeList && paymentTypeList.length > 0,
        accountList: accountList,
        cashiercheckList: null
      };

      return {
        code: 0,
        message: 'OK',
        data: policyDataResult
      };
    } catch (e) {
      this.logger.error('getPolicyPaymentDetail - error excepcion: ' + e.message);
      throw new Error('Error en el servicio de busqueda de datos de poliza de salud. Error: ' + e.message);
    }
  }

  async getLastDenounceDate(
    insuredRut: string,
    companyRut: string,
    policyNumber: number,
    user: IUserSSO
  ): Promise<IResponseDTO> {
    let totalPage = 1;
    let servicePage = 1;
    let denounceList: IDenounce[] = [];

    this.logger.info('Obteniendo Fecha de ultimo denuncio');

    do {
      let listaDenuncioResponse: IPagedResponse<IDenounce>;
      if (policyNumber) {
        const denouncesByPolicyInput: IDenounceServiceInput = {
          rutInsuranceCo: Utils.RUTINSURANCECONUMBER,
          insuredRut: Utils.getRutNumber(insuredRut),
          policyNumber: policyNumber,
          startDate: moment().subtract(12, 'months').toDate(),
          endDate: moment().toDate(),
          page: servicePage,
          limit: config.VSQueryLimit
        };
        listaDenuncioResponse = await this.claimsApi.getDenouncesByPolicy(denouncesByPolicyInput, user);
      } else {
        const denouncesByPolicyInput: IDenounceServiceInput = {
          rutInsuranceCo: Utils.RUTINSURANCECONUMBER,
          companyRut: Utils.getRutNumber(companyRut),
          insuredRut: Utils.getRutNumber(insuredRut),
          startDate: moment().subtract(2, 'months').toDate(),
          endDate: moment().toDate(),
          page: servicePage,
          limit: config.VSQueryLimit
        };
        listaDenuncioResponse = await this.claimsApi.getDenouncesByCompanyAndInsured(denouncesByPolicyInput, user);
      }
      if (servicePage == 1 && listaDenuncioResponse == null)
        return {
          code: 0,
          message: 'SIN DENUNCIOS',
          data: moment().subtract(1, 'month').toDate()
        };

      denounceList = denounceList.concat(listaDenuncioResponse.data);
      totalPage = listaDenuncioResponse.totalPage;
      servicePage++;
    } while (servicePage <= totalPage);

    let finalDate: Date = denounceList[0].denounceDate;

    denounceList.forEach((denounce: IDenounce) => {
      if (denounce.denounceDate.getTime() > finalDate.getTime()) finalDate = denounce.denounceDate;
    });

    return {
      code: 0,
      message: 'OK',
      data: finalDate
    };
  }

  private calculateBenefits(benefits: Array<IBenefitDTO>): IBenefitDTO {
    const incurredExpense: number = benefits.reduce(function (sum: number, d: IBenefitDTO) {
      return sum + d.incurredExpense;
    }, 0);
    const isapreContribution: number = benefits.reduce(function (sum: number, d: IBenefitDTO) {
      return sum + d.isapreContribution;
    }, 0);
    const chargedAmount: number = benefits.reduce(function (sum: number, d: IBenefitDTO) {
      return sum + d.chargedAmount;
    }, 0);
    const bmiAmount: number = benefits.reduce(function (sum: number, d: IBenefitDTO) {
      return sum + d.bmiAmount;
    }, 0);
    const base: number = benefits.reduce(function (sum: number, d: IBenefitDTO) {
      return sum + d.base;
    }, 0);
    const deductible: number = benefits.reduce(function (sum: number, d: IBenefitDTO) {
      return sum + d.deductible;
    }, 0);
    const refund: number = benefits.reduce(function (sum: number, d: IBenefitDTO) {
      return sum + d.refund;
    }, 0);
    return {
      incurredExpense: incurredExpense,
      isapreContribution: isapreContribution,
      chargedAmount: chargedAmount,
      bmiAmount: bmiAmount,
      base: base,
      deductible: deductible,
      refund: refund
    };
  }
}
