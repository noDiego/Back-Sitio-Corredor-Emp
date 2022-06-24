import * as exceljs from 'exceljs';
import { Workbook, Worksheet } from 'exceljs';
import moment from 'moment';
import { Inject, Service } from 'typedi';
import config from '../../config';
import {
  PAYROLL_DETAIL_STATUS,
  PAYROLL_STATUS,
  PAYROLL_STATUS_VS,
  PAYROLL_STATUS_VS_DETAIL,
  POLICY_STATUS
} from '../../constants/status';
import { EXCLUSION_TYPE_OPTIONS, KINSHIP, PAYROLL_TYPE, PAYROLL_TYPE_OPTIONS } from '../../constants/types';
import Utils, { clone } from '../../utils/utils';
import emailValidator from 'email-validator';
import { IValueObjectV1 } from '../../domain/interfaces/dto/v1/IValueObject';
import {
  IPayrollDetailDTO,
  IPayrollDTO,
  IValidateChangePlan,
  IValidateChangeSubsidiary,
  IValidateExclusionInsured,
  IValidateInclusionInsured,
  IValidateInclXLSInput,
  IValidateVirtualSubscription
} from '../../domain/interfaces/dto/v1/IPayroll';
import { IAzureUploadResult, IResponseDTO } from '../../utils/interfaces/IResponse';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import CommonService from './commonService';
import PayrollRepository from '../../infrastructure/database/payrollRepository';
import AzureStorageRepository from '../../infrastructure/repositories/azureStorageRepository';
import AzureBusClient from '../../infrastructure/clients/azureBusClient';
import { IError } from '../../utils/interfaces/IError';
import rutjs from 'rut.js';
import { IPayrollService } from '../../domain/interfaces/services/IPayrollService';
import PolicyApi from '../../infrastructure/clients/policyApi';
import SubscriptionsApi from '../../infrastructure/clients/subscriptionsApi';
import { InsuredVirtualSubscription, VirtualSubscriptionResponse } from '../../infrastructure/clients/dto/insured';
import { IPolicy } from '../../domain/interfaces/dto/v3/IPolicy';
import PolicyService from './policyService';
import { IPagedResponse } from '../../domain/interfaces/dto/v1/IResponse';
import { Logger } from '../../loaders/logger';
import { IServiceResponse } from '../../domain/interfaces/dto/v3/IServiceResponse';
import { ICodeObject } from '../../domain/interfaces/dto/v3/ICodeObject';
import { IInsured } from '../../domain/interfaces/dto/v3/IInsured';
import { IMulterFile } from '../../domain/interfaces/dto/v3/IMulterFile';
import { IInsuredGroupChangeInput } from '../../domain/interfaces/dto/v3/IInsuredGroup';
import { ISubsidiaryChangeInput } from '../../domain/interfaces/dto/v3/ISubsidiary';

@Service('PayrollService')
export default class PayrollService implements IPayrollService {
  @Inject('logger') private readonly logger: Logger;
  @Inject('AzureStorageRepository') private readonly storageRepositoryService: AzureStorageRepository;
  @Inject('PayrollRepository') private readonly payrollRepository: PayrollRepository;
  @Inject('CommonService') private readonly commonService: CommonService;
  @Inject('AzureBusClient') private readonly serviceBusService: AzureBusClient;
  @Inject('PolicyApi') private readonly policyApi: PolicyApi;
  @Inject('PolicyService') private readonly policyService: PolicyService;
  @Inject('SubscriptionsApi') private readonly subscriptionsApi: SubscriptionsApi;

  async addPayroll(
    payroll: IPayrollDTO,
    detail: IPayrollDetailDTO,
    beneficiaries: string[],
    user: IUserSSO
  ): Promise<IResponseDTO> {
    this.logger.info(`Iniciando procesamiento de nomina individual tipo: ${payroll.type}`);

    let errores: string[];

    switch (payroll.type) {
      case PAYROLL_TYPE.VIRTUAL_SUBSCRIPTION_INDIVIDUAL:
        return this.addVirtualSubscription(payroll, detail, beneficiaries, user);
      // Se procesa distinto por manejo de beneficiarios
      case PAYROLL_TYPE.EXCLUSION_INSURED_INDIVIDUAL:
        errores = await this.validateExclusionInsuredSingle(payroll, detail, user.preferredUsername);
        break;
      case PAYROLL_TYPE.CHANGE_PLAN_INDIVIDUAL:
        errores = await this.validateChangePlanSingle(payroll, detail, user.preferredUsername);
        break;
      case PAYROLL_TYPE.CHANGE_AFFILIATE_INDIVIDUAL:
        errores = await this.validateChangeSubsidiarySingle(payroll, detail, user.preferredUsername);
        break;
      default:
        throw new IError('TIPO INVALIDO', 'Error', -1);
    }

    if (errores.length > 0) return { code: 1, data: errores, message: 'Error' };

    payroll.status = PAYROLL_STATUS.TERMINADO;
    payroll.creationDate = new Date();
    const payrollSaved: IPayrollDTO = await this.payrollRepository.insertPayroll(payroll);

    detail.payrollId = payrollSaved.id;
    detail.creationDate = payroll.creationDate;
    detail.status = PAYROLL_DETAIL_STATUS.TERMINADO;
    const responseVS: IServiceResponse = await this.sendPayrollData(payroll, detail, user);
    this.logger.info(`Respuesta servicio sendPayrollData: ${responseVS}`);
    const detailSaved: IPayrollDetailDTO = await this.payrollRepository.addPayrollDetail(clone(detail));
    payrollSaved.details.push(detailSaved);

    return { code: 0, data: Utils.jsonClean([payrollSaved]), message: 'OK' };
  }

  private async sendInsuredIndividual(
    payroll: IPayrollDTO,
    detailSaved: IPayrollDetailDTO,
    user: IUserSSO
  ): Promise<IServiceResponse> {
    const nameOfA: EXCLUSION_TYPE_OPTIONS = EXCLUSION_TYPE_OPTIONS[payroll.exclusionType];
    if (nameOfA == EXCLUSION_TYPE_OPTIONS.EXCLUDE_FROM_ALL) {
      const insuredRutNumber: number = detailSaved.insuredRut;
      let policiesList: IPolicy[] = [];
      let userPoliciesList: IPolicy[] = [];
      let pageService = 1;
      let totalPages: number;

      do {
        //traer lista de polizas del asegurado
        const insuredPolicies: IPagedResponse<IPolicy> = await this.policyApi.getPoliciesByInsured(
          insuredRutNumber,
          Utils.getRutNumber(Utils.RUTINSURANCECO),
          1,
          config.VSQueryLimit,
          user
        );
        policiesList = policiesList.concat(insuredPolicies.data);
        totalPages = insuredPolicies.totalPage;
        pageService++;
      } while (pageService <= totalPages);

      if (policiesList && policiesList.length > 0) {
        const policyUserList: number[] = await this.policyService.getUserPoliciesList(user);
        for (const policyNumber of policyUserList) {
          const policyData: IPolicy = policiesList.find((p: IPolicy) => p.policyNumber == policyNumber);
          if (policyData) userPoliciesList.push(policyData);
        }
        if (userPoliciesList && userPoliciesList.length > 0) {
          userPoliciesList = userPoliciesList.filter(
            (policy: IPolicy) => rutjs.format(policy.company.rut) == rutjs.format(payroll.contractorRut)
          );
        }
      }
      let retorno: IServiceResponse;
      for (const policyValidated of userPoliciesList) {
        this.logger.info(
          `Exlusion y envio de datos VS para poliza:  ${policyValidated.policyNumber} y rut de asegurado: ${detailSaved.insuredRut}`
        );
        retorno = await this.policyApi.exclusionInsured(
          detailSaved.insuredRut,
          detailSaved.insuredDV,
          policyValidated.policyNumber,
          detailSaved.endDate,
          user
        );
      }
      return retorno;
    } else {
      this.logger.info(
        `Exlusion y envio de datos VS para poliza:  ${payroll.policy} y rut de asegurado: ${detailSaved.insuredRut}`
      );
      return await this.policyApi.exclusionInsured(
        detailSaved.insuredRut,
        detailSaved.insuredDV,
        payroll.policy,
        detailSaved.endDate,
        user
      );
    }
  }

  async sendPayrollData(
    payroll: IPayrollDTO,
    detailSaved: IPayrollDetailDTO,
    user: IUserSSO
  ): Promise<IServiceResponse> {
    switch (payroll.type) {
      case PAYROLL_TYPE.EXCLUSION_INSURED_INDIVIDUAL:
        return await this.sendInsuredIndividual(payroll, detailSaved, user);

      case PAYROLL_TYPE.CHANGE_PLAN_INDIVIDUAL:
        const inputGroupChange: IInsuredGroupChangeInput = {
          insuredRut: detailSaved.insuredRut,
          insuredDV: detailSaved.insuredDV,
          policyNumber: payroll.policy,
          insuredGroup: Number(payroll.group),
          startDate: detailSaved.initDate,
          capital: Number(detailSaved.capital),
          rent: Number(detailSaved.income)
        };
        return await this.policyApi.insuredGroupChange(inputGroupChange, user);
      case PAYROLL_TYPE.CHANGE_AFFILIATE_INDIVIDUAL:
        const inputSubsChange: ISubsidiaryChangeInput = {
          insuredRut: detailSaved.insuredRut,
          subsidiary: Number(payroll.subsidiaryCode),
          policyNumber: payroll.policy,
          insuredGroup: Number(payroll.group),
          startDate: detailSaved.initDate,
          capital: Number(detailSaved.capital),
          rent: Number(detailSaved.income)
        };
        return await this.policyApi.insuredSubsidiaryChange(inputSubsChange, user);
      default:
        break;
    }
  }

  async addVirtualSubscription(
    payroll: IPayrollDTO,
    detail: IPayrollDetailDTO,
    beneficiaries: string[],
    user: IUserSSO
  ): Promise<IResponseDTO> {
    let errores: string[] = [];
    errores = await this.validateVirtualSubscriptionSingle(payroll, detail, user);

    if (errores.length != 0) return { code: 1, data: errores, message: 'Error' };

    payroll.creationDate = new Date();
    payroll.status = PAYROLL_STATUS.TERMINADO;
    const payrollSaved: IPayrollDTO = await this.payrollRepository.insertPayroll(payroll);
    detail.payrollId = payrollSaved.id;
    detail.creationDate = payroll.creationDate;
    detail.status = PAYROLL_DETAIL_STATUS.TERMINADO;

    payrollSaved.details = [];
    if (!beneficiaries || beneficiaries.length == 0) {
      const detailSaved: IPayrollDetailDTO = await this.payrollRepository.addPayrollDetail(clone(detail));
      payrollSaved.details.push(detailSaved);
    } else {
      for (const beneficiaryRut of beneficiaries) {
        const detailObject: IPayrollDetailDTO = clone(detail);
        const rutSinDigito: string = rutjs.format(beneficiaryRut).replace(/\./g, '').split('-')[0];
        const DV: string = rutjs.format(beneficiaryRut).replace(/\./g, '').split('-')[1];
        detailObject.dependentRut = Number(rutSinDigito);
        detailObject.dependentDV = DV;
        const detailSaved: IPayrollDetailDTO = await this.payrollRepository.addPayrollDetail(detailObject);
        payrollSaved.details.push(detailSaved);
      }
    }

    const insuredsArray: InsuredVirtualSubscription[] = [];

    insuredsArray.push({
      policyNumber: payroll.policy,
      rut: Number(detail.insuredRut),
      dv: detail.insuredDV,
      email: detail.email,
      insuredGroup: payroll.group,
      contractDate: detail.contractDate,
      startValidityDate: detail.initDate,
      capital: Number(detail.capital),
      rent: Number(detail.income)
    });

    const responseVS: VirtualSubscriptionResponse = await this.subscriptionsApi.virtualSubscription(
      insuredsArray,
      user
    );
    this.logger.info(`Respuesta servicio sendPayrollData: ${responseVS}`);
    return { code: 0, data: Utils.jsonClean(payrollSaved), message: 'OK' };
  }

  async createPayroll(file: IMulterFile, payroll: IPayrollDTO, user: IUserSSO): Promise<IResponseDTO> {
    try {
      if (payroll) {
        const bancos: ICodeObject[] = await this.commonService.listaBancos(user);
        const previsiones: ICodeObject[] = await this.commonService.listaPrevisiones(user);
        const kinships: string[] = Object.keys(KINSHIP);

        const payrollValidated: IPayrollDTO = await this.validatePayrollXLS(
          payroll,
          file,
          bancos,
          previsiones,
          kinships,
          user
        );

        if (!payrollValidated.base64) {
          const payrollDTO: IPayrollDTO = {
            creationDate: new Date(),
            type: payroll.type,
            typeDescription: payroll.typeDescription,
            exclusionType: payroll.exclusionType,
            fileName: file.originalname,
            fileExtension: file.originalname.split('.').pop(),
            fileMimeType: file.mimetype,
            policy: payroll.policy,
            contractorRut: payroll.contractorRut,
            contractorName: payroll.contractorName,
            subsidiaryRut: payroll.subsidiaryRut,
            subsidiaryName: payroll.subsidiaryName,
            subsidiaryCode: payroll.subsidiaryCode,
            plan: payroll.plan,
            planCode: payroll.planCode,
            group: payroll.group,
            groupName: payroll.groupName,
            capitalRequired: payroll.capitalRequired,
            incomeRequired: payroll.incomeRequired,
            status: PAYROLL_STATUS.NO_CARGADO.toString()
          };

          const payrollCreated: IPayrollDTO = await this.payrollRepository.insertPayroll(payrollDTO);

          const directoryPath = `${payrollCreated.id}/${file.originalname}`;

          const allowedextensions: string[] = [];
          allowedextensions.push('.xlsx');
          const uploadResult: IAzureUploadResult = await this.storageRepositoryService.uploadFile(
            file,
            payrollDTO.id,
            config.payrollContainer,
            directoryPath,
            allowedextensions
          );

          if (uploadResult.success) {
            payrollCreated.status = PAYROLL_STATUS.EN_PROCESO.toString();
            payrollCreated.blobName = directoryPath;
            const payrollUpdated: IPayrollDTO = await this.payrollRepository.updatePayroll(payrollCreated);
            const body: string = JSON.stringify({
              payrollId: payrollUpdated.id,
              user: user
            });
            const label = 'Payroll Queue';

            const queueJob: boolean = await this.serviceBusService.sendMessageQueue(
              user.preferredUsername,
              config.payrollServiceBusQueueName,
              body,
              label,
              null
            );
            if (queueJob) {
              throw new IError('Error al crear la cola de payroll', 'AzureError', 1);
            }

            return {
              code: 0,
              message: 'OK',
              data: payrollUpdated
            };
          } else {
            return {
              code: 1,
              message: 'Error al subir archivo'
            };
          }
        }
        payrollValidated.fileName = file.originalname;
        payrollValidated.fileMimeType = file.mimetype;
        payrollValidated.fileExtension = file.originalname.split('.').pop();
        return {
          code: 1,
          message: 'Archivo con errores',
          data: payrollValidated
        };
      }
    } catch (error) {
      throw new Error('Error en proceso de crear nomina. Error: ' + error.message);
    }
  }

  async downloadPayrollFile(payrollId: number, user: IUserSSO): Promise<IResponseDTO> {
    try {
      const payroll: IPayrollDTO = await this.payrollRepository.getPayrollById(payrollId);

      if (payroll) {
        const fileBuffer: Buffer = await this.storageRepositoryService.getFile(
          payroll.blobName,
          user.preferredUsername,
          config.payrollContainer
        );
        payroll.buffer = fileBuffer;
        return {
          code: 0,
          message: 'OK',
          data: payroll
        };
      }
    } catch (error) {
      throw new Error('Error al obtener el archivo de nomina. Error: ' + error.message);
    }
  }

  async getHistoryPayrollData(
    dayRange: number,
    type: string,
    page: number,
    limit: number,
    contractorRut: string,
    insuredRut: string
  ): Promise<IResponseDTO> {
    try {
      const estados: string[] = [];
      //estados.push(PAYROLL_STATUS.EN_PROCESO);
      estados.push(PAYROLL_STATUS.TERMINADO);
      estados.push(PAYROLL_STATUS.TERMINADO_CON_ERROR);

      const today: Date = new Date();
      const daysAgoDate: Date = moment().subtract(dayRange, 'days').toDate();

      let payrolls: IPayrollDTO[];

      if (insuredRut) {
        const rutInsuredNumber: number = Utils.getRutNumber(insuredRut);
        payrolls = await this.payrollRepository.getPayrollsHistoryByInsuredRut(
          daysAgoDate,
          today,
          type,
          estados,
          contractorRut,
          rutInsuredNumber.toString()
        );
      } else {
        payrolls = await this.payrollRepository.getPayrollsHistoryByEstado(
          daysAgoDate,
          today,
          type,
          estados,
          contractorRut
        );
      }

      if (payrolls.length > 0) {
        //Se recorren resultados para quitar details de masivos y agregar filename de invalidos
        for (const payroll of payrolls) {
          if (this.esMasivo(payroll.type)) delete payroll.details;

          await this.setPayrollStatusVS(payroll);
        }

        const startIndex: number = (page - 1) * limit;
        const endIndex: number = page * limit;
        const recordTotal: number = payrolls.length;
        const totalPage: number = Math.ceil(recordTotal / limit);

        const result: IPayrollDTO[] = payrolls.slice(startIndex, endIndex);

        return {
          code: 0,
          message: 'OK',
          data: Utils.jsonClean(result),
          page: page,
          limit: limit,
          totalPage: totalPage,
          recordTotal: recordTotal
        };
      }

      return {
        code: 0,
        message: 'OK',
        data: [],
        page: page,
        limit: limit,
        totalPage: 1,
        recordTotal: 0
      };
    } catch (error) {
      throw new Error('Error al obtener el listado de carga de nominas. Error: ' + error.message);
    }
  }

  private async validatePayrollXLS(
    payroll: IPayrollDTO,
    file: any,
    bancos: IValueObjectV1[],
    previsiones: IValueObjectV1[],
    kinships: string[],
    user: IUserSSO
  ): Promise<IPayrollDTO> {
    try {
      const days30AgoDate: Date = moment().subtract(30, 'days').toDate();
      let policyData: IPolicy = null;
      const nameOfA: EXCLUSION_TYPE_OPTIONS = EXCLUSION_TYPE_OPTIONS[payroll.exclusionType];
      if (
        payroll.typeDescription != PAYROLL_TYPE_OPTIONS.EXCLUSION_INSURED ||
        nameOfA == EXCLUSION_TYPE_OPTIONS.EXCLUDE_FROM_SINGLE
      )
        policyData = await this.policyApi.getPolicyDetail(payroll.policy, user);

      const wb: Workbook = new exceljs.Workbook();
      let hasError = false;

      await wb.xlsx.load(file.buffer).then(async () => {
        const sh: Worksheet = wb.getWorksheet(1);

        for (let i = 2; i <= sh.actualRowCount; i++) {
          switch (payroll.typeDescription) {
            case PAYROLL_TYPE_OPTIONS.CHANGE_AFFILIATE:
              hasError = this.validateChangeAffiliateXLS(sh, i, days30AgoDate, policyData);
              break;

            case PAYROLL_TYPE_OPTIONS.CHANGE_PLAN:
              hasError = this.validateChangePlanXLS(sh, i, days30AgoDate, payroll, policyData);
              break;

            case PAYROLL_TYPE_OPTIONS.EXCLUSION_INSURED:
              hasError = this.validateExclusionInsuredXLS(sh, i, days30AgoDate, nameOfA, policyData);
              break;

            case PAYROLL_TYPE_OPTIONS.INCLUSION_INSURED:
              const input: IValidateInclXLSInput = {
                bancos: bancos,
                days30AgoDate: days30AgoDate,
                kinships: kinships,
                payroll: payroll,
                policyData: policyData,
                previsiones: previsiones,
                sh: sh
              };
              hasError = this.validateInclusionInsuredXLS(i, input);
              break;

            case PAYROLL_TYPE_OPTIONS.VIRTUAL_SUBSCRIPTION:
              hasError = this.virtualSubscriptionXLS(sh, i, payroll, policyData);
              break;
            default: {
              throw new IError('Tipo de nomina invalido', 'Tipo nomina invalido', 99);
            }
          }
        }

        if (hasError) {
          const arrayBuffer: ArrayBuffer = await wb.xlsx.writeBuffer();
          const buffer: Buffer = await Utils.arrayBufferToBuffer(arrayBuffer);
          const base64: string = buffer.toString('base64');
          payroll.base64 = base64;
        }
      });
    } catch (error) {
      throw new Error('Error al obtener el listado de carga de nominas. Error: ' + error.message);
    }
    return payroll;
  }

  private virtualSubscriptionXLS(sh: Worksheet, i: number, payroll: IPayrollDTO, policyData: IPolicy): boolean {
    const policy: number = sh.getRow(i).getCell(1).value ? Number(sh.getRow(i).getCell(1).value) : null;
    const insuredRut: string = sh.getRow(i).getCell(2).value ? sh.getRow(i).getCell(2).value.toString() : null;
    const dependentRut: string = sh.getRow(i).getCell(3).value ? sh.getRow(i).getCell(3).value.toString() : null;
    const email: string = sh.getRow(i).getCell(4).value ? sh.getRow(i).getCell(4).value.toString() : null;
    const groupCode: number = sh.getRow(i).getCell(5).value ? Number(sh.getRow(i).getCell(5).value) : null;
    let contractDate: Date;
    const contractDateExcel: string = sh.getRow(i).getCell(6).value ? sh.getRow(i).getCell(6).value.toString() : null;
    if (contractDateExcel) {
      contractDate = Utils.timeZoneSet(moment(contractDateExcel).toDate());
    }
    let initDate: Date;
    const initDateExcel: string = sh.getRow(i).getCell(7).value ? sh.getRow(i).getCell(7).value.toString() : null;
    if (initDateExcel) {
      initDate = Utils.timeZoneSet(moment(initDateExcel).toDate());
    }
    const income: number = sh.getRow(i).getCell(8).value ? Number(sh.getRow(i).getCell(8).value) : null;
    const capital: number = sh.getRow(i).getCell(9).value ? Number(sh.getRow(i).getCell(9).value) : null;
    const full: string = sh.getRow(i).getCell(10).value ? sh.getRow(i).getCell(10).value.toString() : null;

    const values: IValidateVirtualSubscription = {
      policy: policy,
      insuredRut: insuredRut,
      dependentRut: dependentRut,
      email: email,
      groupCode: groupCode,
      capitalRequired: payroll.capitalRequired,
      incomeRequired: payroll.incomeRequired,
      income: income,
      capital: capital,
      full: full
    };

    const errores: string[] = this.validateVirtualSubscription(contractDate, initDate, values);
    if (POLICY_STATUS.VIGENTE != policyData.status) {
      errores.unshift('POLIZA no vigente');
    }

    if (errores.length > 0) {
      sh.getRow(1).getCell(11).value = 'ERRORES';
      sh.getRow(i).getCell(11).value = errores.toString();
      return true;
    }
    return false;
  }

  private validateInclusionInsuredXLS(index: number, input: IValidateInclXLSInput): boolean {
    const insuredRut: string = input.sh.getRow(index).getCell(1).value
      ? input.sh.getRow(index).getCell(1).value.toString()
      : null;
    const insuredDV: string = input.sh.getRow(index).getCell(2).value
      ? input.sh.getRow(index).getCell(2).value.toString()
      : '0';
    const dependentRut: string = input.sh.getRow(index).getCell(3).value
      ? input.sh.getRow(index).getCell(3).value.toString()
      : null;
    const dependendDV: string = input.sh.getRow(index).getCell(4).value
      ? input.sh.getRow(index).getCell(4).value.toString()
      : null;
    const name: string = input.sh.getRow(index).getCell(5).value
      ? input.sh.getRow(index).getCell(5).value.toString()
      : null;
    const lastName: string = input.sh.getRow(index).getCell(6).value
      ? input.sh.getRow(index).getCell(6).value.toString()
      : null;
    const gender: string = input.sh.getRow(index).getCell(7).value
      ? input.sh.getRow(index).getCell(7).value.toString()
      : null;
    const kinship: string = input.sh.getRow(index).getCell(9).value
      ? input.sh.getRow(index).getCell(9).value.toString()
      : null;
    const capital: number = input.sh.getRow(index).getCell(10).value
      ? Number(input.sh.getRow(index).getCell(10).value)
      : null;
    const income: number = input.sh.getRow(index).getCell(11).value
      ? Number(input.sh.getRow(index).getCell(11).value)
      : null;
    const phone: string = input.sh.getRow(index).getCell(13).value
      ? input.sh.getRow(index).getCell(13).value.toString()
      : null;
    const email: string = input.sh.getRow(index).getCell(14).value
      ? input.sh.getRow(index).getCell(14).value.toString()
      : null;
    const bank: string = input.sh.getRow(index).getCell(15).value
      ? input.sh.getRow(index).getCell(15).value.toString()
      : null;
    const bankAccountNumber: number = input.sh.getRow(index).getCell(16).value
      ? Number(input.sh.getRow(index).getCell(16).value)
      : null;
    const isapre: string = input.sh.getRow(index).getCell(17).value
      ? input.sh.getRow(index).getCell(17).value.toString()
      : null;

    const values: IValidateInclusionInsured = {
      insuredRut: insuredRut,
      insuredDV: insuredDV,
      dependentRut: dependentRut,
      dependendDV: dependendDV,
      name: name,
      lastName: lastName,
      gender: gender,
      days30AgoDate: input.days30AgoDate,
      kinship: kinship,
      email: email,
      capitalRequired: input.payroll.capitalRequired,
      incomeRequired: input.payroll.incomeRequired,
      capital: capital,
      income: income,
      bank: bank,
      bankAccountNumber: bankAccountNumber,
      phone: phone,
      isapre: isapre
    };
    const inicioCorrecto: Date = Utils.timeZoneSet(input.sh.getRow(index).getCell(12).value as Date);
    const birthdayCorrecto: Date = Utils.timeZoneSet(input.sh.getRow(index).getCell(8).value as Date);

    const errores: string[] = this.validateInclusionInsured(
      inicioCorrecto,
      birthdayCorrecto,
      input.policyData.firstTerm,
      input.bancos,
      input.kinships,
      input.previsiones,
      values
    );
    if (POLICY_STATUS.VIGENTE != input.policyData.status) {
      errores.unshift('POLIZA no vigente');
    }

    if (errores.length > 0) {
      input.sh.getRow(1).getCell(18).value = 'ERRORES';
      input.sh.getRow(index).getCell(18).value = errores.toString();
      return true;
    }
    return false;
  }

  private validateExclusionInsuredXLS(
    sh: Worksheet,
    i: number,
    days30AgoDate: Date,
    nameOfA: EXCLUSION_TYPE_OPTIONS,
    policyData: IPolicy
  ): boolean {
    const insuredRut: string = sh.getRow(i).getCell(1).value ? sh.getRow(i).getCell(1).value.toString() : null;
    const insuredDV: string = sh.getRow(i).getCell(2).value ? sh.getRow(i).getCell(2).value.toString() : '0';

    const values: IValidateExclusionInsured = {
      insuredRut: insuredRut,
      insuredDV: insuredDV,
      days30AgoDate: days30AgoDate
    };

    const dateCorrecta: Date = Utils.timeZoneSet(sh.getRow(i).getCell(3).value as Date);
    const errores: string[] = this.validateExclusionInsured(dateCorrecta, values);
    if (nameOfA == EXCLUSION_TYPE_OPTIONS.EXCLUDE_FROM_SINGLE) {
      if (POLICY_STATUS.VIGENTE != policyData.status) {
        errores.unshift('POLIZA no vigente');
      }
    }

    if (errores.length > 0) {
      sh.getRow(1).getCell(4).value = 'ERRORES';
      sh.getRow(i).getCell(4).value = errores.toString();
      return true;
    }
    return false;
  }

  private validateChangePlanXLS(
    sh: Worksheet,
    i: number,
    days30AgoDate: Date,
    payroll: IPayrollDTO,
    policyData: IPolicy
  ): boolean {
    const insuredRut: string = sh.getRow(i).getCell(1).value ? sh.getRow(i).getCell(1).value.toString() : null;
    const insuredDV: string = sh.getRow(i).getCell(2).value ? sh.getRow(i).getCell(2).value.toString() : '0';
    const capital: number = sh.getRow(i).getCell(4).value ? Number(sh.getRow(i).getCell(4).value) : null;
    const income: number = sh.getRow(i).getCell(5).value ? Number(sh.getRow(i).getCell(5).value) : null;

    const values: IValidateChangePlan = {
      insuredRut: insuredRut,
      insuredDV: insuredDV,
      days30AgoDate: days30AgoDate,
      capitalRequired: payroll.capitalRequired,
      incomeRequired: payroll.incomeRequired,
      capital: capital,
      income: income
    };

    const dateCorrecta: Date = Utils.timeZoneSet(sh.getRow(i).getCell(3).value as Date);
    const errores: string[] = this.validateChangePlan(dateCorrecta, values);
    if (POLICY_STATUS.VIGENTE != policyData.status) {
      errores.unshift('POLIZA no vigente');
    }

    if (errores.length > 0) {
      sh.getRow(1).getCell(6).value = 'ERRORES';
      sh.getRow(i).getCell(6).value = errores.toString();
      return true;
    }
    return false;
  }

  private validateChangeAffiliateXLS(sh: Worksheet, i: number, days30AgoDate: Date, policyData: IPolicy): boolean {
    const insuredRut: string = sh.getRow(i).getCell(1).value ? sh.getRow(i).getCell(1).value.toString() : null;
    const insuredDV: string = sh.getRow(i).getCell(2).value ? sh.getRow(i).getCell(2).value.toString() : '0';

    const values: IValidateChangeSubsidiary = {
      insuredRut: insuredRut,
      insuredDV: insuredDV,
      days30AgoDate: days30AgoDate
    };

    const dateCorrecta: Date = Utils.timeZoneSet(sh.getRow(i).getCell(3).value as Date);

    const errores: string[] = this.validateChangeSubsidiary(dateCorrecta, values);
    if (POLICY_STATUS.VIGENTE != policyData.status) {
      errores.unshift('POLIZA no vigente');
    }

    if (errores.length > 0) {
      sh.getRow(1).getCell(4).value = 'ERRORES';
      sh.getRow(i).getCell(4).value = errores.toString();
      return true;
    }
    return false;
  }

  private validateChangeSubsidiary(initDate: Date, values: IValidateChangeSubsidiary): string[] {
    const errores: string[] = [];
    if (values.insuredRut == undefined || !values.insuredRut.match(Utils.REGEX_RUT)) errores.push('RUT invalido');
    if (
      values.insuredDV == undefined ||
      !values.insuredDV.match(Utils.REGEX_DV) ||
      !Utils.validateRut(values.insuredRut + '-' + values.insuredDV)
    )
      errores.push('DV invalido');
    if (initDate == undefined || !(initDate instanceof Date)) {
      errores.push('FECHA_INICIO invalido');
    } else {
      const dateInit: Date = new Date(initDate);
      if (dateInit < values.days30AgoDate) {
        errores.push('FECHA_INICIO no cumple con retroactivo de 30 dias');
      }
    }
    return errores;
  }

  private validateChangePlan(initDate: Date, values: IValidateChangePlan): string[] {
    const errores: string[] = [];
    if (values.insuredRut == undefined || !values.insuredRut.match(Utils.REGEX_RUT)) errores.push('RUT invalido');
    if (
      values.insuredDV == undefined ||
      !values.insuredDV.match(Utils.REGEX_DV) ||
      !Utils.validateRut(values.insuredRut + '-' + values.insuredDV)
    )
      errores.push('DV invalido');
    if (initDate == undefined || !(initDate instanceof Date)) {
      errores.push('FECHA_INICIO invalido');
    } else {
      const dateInit: Date = new Date(initDate);
      if (dateInit < values.days30AgoDate) {
        errores.push('FECHA_INICIO no cumple con retroactivo de 30 dias');
      }
    }

    if (values.capitalRequired) {
      if (values.capital == undefined || !String(values.capital).match(Utils.REGEX_MONTO))
        errores.push('CAPITAL invalido');
    }
    if (values.incomeRequired) {
      if (values.income == undefined || !String(values.income).match(Utils.REGEX_MONTO)) errores.push('RENTA invalido');
    }
    return errores;
  }

  private validateExclusionInsured(endDate: Date, values: IValidateExclusionInsured): string[] {
    const errores: string[] = [];
    if (values.insuredRut == undefined || !values.insuredRut.match(Utils.REGEX_RUT)) errores.push('RUT invalido');
    if (
      values.insuredDV == undefined ||
      !values.insuredDV.match(Utils.REGEX_DV) ||
      !Utils.validateRut(values.insuredRut + '-' + values.insuredDV)
    )
      errores.push('DV invalido');
    if (endDate == undefined || !(endDate instanceof Date)) {
      errores.push('FECHA_TERMINO invalido');
    } else {
      const dateEnd: Date = new Date(endDate);
      if (dateEnd < values.days30AgoDate) {
        errores.push('FECHA_TERMINO no cumple con retroactivo de 30 dias');
      }
    }

    return errores;
  }

  private validateChangeSubsidiarySingle(payroll: IPayrollDTO, detail: IPayrollDetailDTO, rut: string): string[] {
    const errores: string[] = [];
    this.logger.info(`Inicio validacion para cambio de filial individual rut usuario: ${rut}`);

    if (!rutjs.validate(payroll.subsidiaryRut) || !payroll.subsidiaryCode)
      errores.push('Se debe ingresar un rut de subsidiario para cambiar');

    if (payroll.subsidiaryRut && !rutjs.validate(detail.insuredRut + detail.insuredDV)) errores.push('RUT invalido');
    if (
      detail.initDate == undefined ||
      !(detail.initDate instanceof Date) ||
      moment(detail.initDate).diff(new Date(), 'days') < -30
    ) {
      errores.push('FECHA_INICIO no cumple con retroactivo de 30 dias');
    }
    return errores;
  }

  private validateChangePlanSingle(payroll: IPayrollDTO, detail: IPayrollDetailDTO, rut: string): string[] {
    const errores: string[] = [];
    this.logger.info(`Inicio validacion para cambio de plan individual rut usuario: ${rut}`);
    if (!rutjs.validate(detail.insuredRut + detail.insuredDV))
      errores.push('RUT' + detail.insuredRut + '-' + detail.insuredDV + ' invalido');

    if (!payroll.planCode) errores.push('Se debe ingresar un codigo de plan para cambiar');

    if (
      detail.initDate == undefined ||
      !(detail.initDate instanceof Date) ||
      moment(detail.initDate).diff(new Date(), 'days') > 30
    ) {
      errores.push('FECHA_INICIO no cumple con retroactivo de 30 dias');
    }

    if (payroll.capitalRequired) {
      if (detail.capital == undefined || !String(detail.capital).match(Utils.REGEX_MONTO))
        errores.push('CAPITAL invalido');
    }
    if (payroll.incomeRequired) {
      if (detail.income == undefined || !String(detail.income).match(Utils.REGEX_MONTO)) errores.push('RENTA invalido');
    }
    return errores;
  }

  private validateExclusionInsuredSingle(payroll: IPayrollDTO, detail: IPayrollDetailDTO, rut: string): string[] {
    const errores: string[] = [];
    this.logger.info(`Inicio validacion para exclusion de asegurado individual rut usuario: ${rut}`);
    if (payroll.exclusionType === undefined) errores.push('Debe definirse tipo de exclusion');
    if (!rutjs.validate(detail.insuredRut + detail.insuredDV))
      errores.push('RUT' + detail.insuredRut + '-' + detail.insuredDV + ' invalido');
    if (
      detail.endDate == undefined ||
      !(detail.endDate instanceof Date) ||
      moment(detail.endDate).diff(new Date(), 'days') > 30 // primera - segunda date: 14-11-2020, actual=18-11-2020, result=-4
      // result=-4
    ) {
      errores.push('FECHA_INICIO no cumple con retroactivo de 30 dias');
    }
    //- validar que no hayan denuncios posteriores a la fecha término de vigencia requerida,
    // en caso de presentarse debe mostrar mensaje "la fecha de exclusión debe ser DD-MM-YY (fecha 1 día después del último gasto presentado) "
    // --- Validacion hecha a nivel de front end ---

    return errores;
  }

  private validateInclusionInsured(
    initDate: Date,
    birthday: Date,
    firtTermDate: Date,
    bancos: IValueObjectV1[],
    kinships: string[],
    previsiones: IValueObjectV1[],
    values: IValidateInclusionInsured
  ): string[] {
    const errores: string[] = [];
    if (values.insuredRut == undefined || !values.insuredRut.match(Utils.REGEX_RUT)) errores.push('RUT invalido');
    if (
      values.insuredDV == undefined ||
      !values.insuredDV.match(Utils.REGEX_DV) ||
      !Utils.validateRut(values.insuredRut + '-' + values.insuredDV)
    )
      errores.push('DV invalido');
    if (values.dependentRut && !values.dependentRut.match(Utils.REGEX_RUT)) errores.push('RUT_DEPENDIENTE invalido');
    if (
      values.dependentRut &&
      (values.dependendDV == undefined ||
        !values.dependendDV.match(Utils.REGEX_DV) ||
        !Utils.validateRut(values.dependentRut + '-' + values.dependendDV))
    )
      errores.push('DV_DEPENDIENTE invalido');

    if (values.name == undefined || !values.name.match(Utils.REGEX_NOMBRES)) errores.push('NOMBRES invalido');
    if (values.lastName == undefined || !values.lastName.match(Utils.REGEX_NOMBRES)) errores.push('APELLIDOS invalido');
    if (birthday == undefined || !(birthday instanceof Date)) errores.push('FECHA_NACIMIENTO invalido');
    if (values.gender == undefined || !values.gender.trim().match(/^[MF]{1}$/)) errores.push('SEXO invalido');
    if (initDate == undefined || !(initDate instanceof Date)) {
      errores.push('FECHA_INICIO invalido');
    } else {
      const dateInit: Date = new Date(initDate);
      if (dateInit < values.days30AgoDate) {
        errores.push('FECHA_INICIO no cumple con retroactivo de 30 dias');
      }
      if (dateInit < firtTermDate) {
        errores.push('FECHA_INICIO no puede ser menor a la fecha original de la póliza');
      }
    }
    if (values.capitalRequired) {
      if (values.capital == undefined || !String(values.capital).match(Utils.REGEX_MONTO))
        errores.push('CAPITAL invalido');
    }
    if (values.incomeRequired) {
      if (values.income == undefined || !String(values.income).match(Utils.REGEX_MONTO)) errores.push('RENTA invalido');
    }
    if (values.kinship.length == 0 || values.kinship == KINSHIP.TITULAR) {
      if (values.email == undefined || !values.email.match(Utils.REGEX_EMAIL))
        errores.push('CORREO_ELECTRONICO invalido');
    }

    if (values.kinship && !kinships.includes(values.kinship.trim())) errores.push('RELACION invalido');

    if (values.bank) {
      if (!bancos.find((x: IValueObjectV1) => x.code == values.bank.trim())) errores.push('BANCO' + ' invalido');
    }
    if (values.bankAccountNumber && String(values.bankAccountNumber).length > 10)
      errores.push('CUENTA_DEPOSITO invalido');
    if (values.phone && !values.phone.match(Utils.REGEX_FONO)) errores.push('FONO invalido');
    if (values.isapre && !previsiones.find((x: IValueObjectV1) => x.name.toUpperCase() == values.isapre.toUpperCase()))
      errores.push('ISAPRE invalido');

    return errores;
  }

  private async validateVirtualSubscriptionSingle(
    payroll: IPayrollDTO,
    detail: IPayrollDetailDTO,
    user: IUserSSO
  ): Promise<string[]> {
    const errores: string[] = [];

    //Se obtienen polizas asignadas a corredor
    const userPolicyList: number[] = await this.policyService.getUserPoliciesList(user);
    const policyUserNumber: number = userPolicyList.find((p: number) => p == payroll.policy);
    if (!policyUserNumber) {
      errores.push('Poliza no corresponde a la cartera del usuario');
    }

    const policyData: IPolicy = await this.policyApi.getPolicyDetail(payroll.policy, user);
    const insuredData: IInsured = await this.policyApi.getInsuredDetail(
      payroll.policy,
      Number(detail.insuredRut),
      user
    );

    //Asegurado no vigente
    this.logger.info('Se valida si asegurado no esta vigente ' + detail.insuredRut);
    if (insuredData) {
      errores.push('Asegurado tiene registros de haber estado vigente');
    }

    //Validacion Ruts
    const insuredRut = `${detail.insuredRut}-${detail.insuredDV}`;
    if (!rutjs.validate(insuredRut)) errores.push('RUT titular invalido');
    if (detail.dependentRut && !rutjs.validate(`${detail.dependentRut}-${detail.dependentDV}`))
      errores.push('RUT' + ' Dependiente invalido');

    //Validacion Email
    if (!emailValidator.validate(detail.email)) errores.push('Email Invalido');

    //Validacion grupo existente en poliza
    let existeGrupo = false;
    for (const group of policyData.insuredGroup) {
      if (group.planCode == Number(payroll.planCode) && group.subsidiaryCode == payroll.subsidiaryCode) {
        payroll.group = String(group.code);
        existeGrupo = true;
        break;
      }
    }
    if (!existeGrupo) {
      errores.push(
        'No existe grupo en poliza(' +
          payroll.policy +
          ') para filial(' +
          payroll.subsidiaryName +
          ') y plan(' +
          payroll.plan +
          ')'
      );
    }

    //Fecha contratacion
    if (moment(detail.initDate).diff(detail.contractDate, 'days') > 30)
      errores.push('FECHA_INICIO y CONTRATACION invalido.' + ' (Diferencia 30 dias)');

    return errores;
  }

  private validateVirtualSubscription(
    contractDate: Date,
    initDate: Date,
    values: IValidateVirtualSubscription
  ): string[] {
    let dateContract: Date;
    let dateInit: Date;
    const errores: string[] = [];
    if (!values.policy) errores.push('POLIZA invalido');
    if (values.insuredRut == undefined || !Utils.validateRut(values.insuredRut)) errores.push('RUT invalido');
    if (values.dependentRut && !Utils.validateRut(values.dependentRut)) errores.push('RUT DEPENDIENTE invalido');
    if (values.email == undefined || !values.email.match(Utils.REGEX_EMAIL))
      errores.push('CORREO_ELECTRONICO invalido');
    if (!values.groupCode) errores.push('GRUPO invalido');
    if (contractDate == undefined || !(contractDate instanceof Date)) {
      errores.push('FECHA_CONTRATACION invalido');
    } else {
      dateContract = new Date(contractDate);
    }
    if (initDate == undefined || !(initDate instanceof Date)) {
      errores.push('FECHA_INICIO invalido');
    } else {
      dateInit = new Date(initDate);
    }
    if (dateContract > dateInit) {
      errores.push('FECHA_CONTRATACION invalido');
      errores.push('FECHA_INICIO invalido');
    }
    if (values.capitalRequired) {
      if (values.capital == undefined || !String(values.capital).match(Utils.REGEX_MONTO))
        errores.push('CAPITAL invalido');
    }
    if (values.incomeRequired) {
      if (values.income == undefined || !String(values.income).match(Utils.REGEX_MONTO)) errores.push('RENTA invalido');
    }
    return errores;
  }

  private esMasivo(status: PAYROLL_TYPE): boolean {
    const statusMasivos: PAYROLL_TYPE[] = [
      PAYROLL_TYPE.CHANGE_AFFILIATE,
      PAYROLL_TYPE.CHANGE_PLAN,
      PAYROLL_TYPE.EXCLUSION_INSURED,
      PAYROLL_TYPE.INCLUSION_INSURED,
      PAYROLL_TYPE.VIRTUAL_SUBSCRIPTION
    ];
    return statusMasivos.includes(status);
  }

  private async setPayrollStatusVS(payroll: IPayrollDTO): Promise<void> {
    if (payroll.status == PAYROLL_STATUS.TERMINADO_CON_ERROR) payroll.status = PAYROLL_STATUS_VS.PROCESADA_CON_ERRORES;
    else payroll.status = PAYROLL_STATUS_VS.PROCESADA_SIN_ERRORES;

    payroll.statusDetail = PayrollService.getStatusDetail(payroll.status, payroll.invalidRows);

    return;
  }

  private static getStatusDetail(status: string, cantidadErrores?: number): string {
    switch (status) {
      case PAYROLL_STATUS_VS.INGRESADO:
        return PAYROLL_STATUS_VS_DETAIL.INGRESADO;
      case PAYROLL_STATUS_VS.PROCESADA_SIN_ERRORES:
        return PAYROLL_STATUS_VS_DETAIL.PROCESADA_SIN_ERRORES;
      case PAYROLL_STATUS_VS.PENDIENTE:
        return PAYROLL_STATUS_VS_DETAIL.PENDIENTE;
      case PAYROLL_STATUS_VS.ERROR_EN_LA_CARGA:
        return PAYROLL_STATUS_VS_DETAIL.ERROR_EN_LA_CARGA;
      case PAYROLL_STATUS_VS.PROCESADA_CON_ERRORES:
        return PAYROLL_STATUS_VS_DETAIL.PROCESADA_CON_ERRORES + cantidadErrores + ' errores';
      default:
        return '';
    }
  }
}
