import { startGlobals, iUserSSO, resetMocks } from '../helpers/globalMocks';
import { Container } from 'typedi';
import logger from '../../src/loaders/logger';
import PayrollService from '../../src/application/services/payrollService';
import { IPayrollDetailDTO, IPayrollDTO } from '../../src/domain/interfaces/dto/v1/IPayroll';
import PayrollRepository from '../../src/infrastructure/database/payrollRepository';
import { IResponseDTO } from '../../src/utils/interfaces/IResponse';
import AdministrationRepository from '../../src/infrastructure/database/administrationRepository';
import { PAYROLL_TYPE, PAYROLL_TYPE_OPTIONS } from '../../src/constants/types';
import { bancosDummy, previsionesDummy } from '../../src/dummy/bancos';
import CommonService from '../../src/application/services/commonService';
import AzureStorageRepository from '../../src/infrastructure/repositories/azureStorageRepository';
import AzureBusClient from '../../src/infrastructure/clients/azureBusClient';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import SubscriptionsApi from '../../src/infrastructure/clients/subscriptionsApi';
import { VirtualSubscriptionResponse } from '../../src/infrastructure/clients/dto/insured';
import { IUserDTO } from '../../src/domain/interfaces/dto/administration/IUserDTO';
import PolicyApi from '../../src/infrastructure/clients/policyApi';
import { IPagedResponse } from '../../src/domain/interfaces/dto/v1/IResponse';
import { IPolicy } from '../../src/domain/interfaces/dto/v3/IPolicy';
import { IInsured } from '../../src/domain/interfaces/dto/v3/IInsured';
import { IServiceResponse } from '../../src/domain/interfaces/dto/v3/IServiceResponse';
import { IMulterFile } from "../../src/domain/interfaces/dto/v3/IMulterFile";
import { clone } from "../../src/utils/utils";

const userData: IUserDTO = {
  clients: [
    {
      name: 'COLBUN  S.A',
      policies: ['1', '281221'],
      rut: '78.734.410-0',
      seeAll: false,
      status: 'ENABLED',
      type: 0
    }
  ],
  email: 'test@test.cl',
  name: 'Juan Perez',
  profiles: [4, 5, 6],
  rut: '11.111.111-1',
  status: 'enabled',
  type: '1'
};

const poliza: IPolicy = {
  renewalId: 11068473,
  renewal: 14,
  policyNumber: 281221,
  insuranceCoRut: '99301000-6',
  holding: { number: 281091, name: 'COLBUN' },
  contractor: { rut: '96505760-9', name: 'COLBUN  S.A  .', bussinessLine: ' ' },
  company: { rut: '96505760-9', name: 'COLBUN  S.A  .', businessActivity: ' ' },
  broker: { rut: '78734410-0', name: 'DE SEGUROS LTDA. MERCER CORREDORES' },
  status: 'VIGENTE',
  firstTerm: new Date('2006-08-01T04:00:00.000Z'),
  startDate: new Date('2019-08-01T04:00:00.000Z'),
  endDate: new Date('2020-07-31T04:00:00.000Z'),
  productDescription: ['ACCIDENTES PERSONALES'],
  numberOfHolders: 5,
  numberOfBeneficiaries: 0,
  products: [{ code: 3, name: 'ACCIDENTES PERSONALES', tokenDoc: null }],
  plans: [
    {
      code: 250188,
      name: 'GUARDIAS ARMADOS',
      requiresCapital: false,
      requiresRent: false,
      products: null
    }
  ],
  subsidiaries: [{ code: 7776, rut: '96505760-9', name: 'COLBUN  S.A  .' }],
  insuredGroup: [
    {
      idGroup: 16925,
      code: 250188,
      name: 'GUARDIAS ARMADOS',
      startDate: new Date('2019-08-01T00:00:00'),
      endDate: new Date('2020-07-31T00:00:00'),
      planCode: 0,
      subsidiaryCode: 7776,
      collectiongGroupCode: 11551
    }
  ],
  collectionGroup: [
    {
      idGroup: 599,
      code: 11556,
      rut: '76528870-3',
      name: 'COBRANZA TERMOELECTRICA  NEHUENCO S.A. 1',
      benefitStatus: 'ACTIVO',
      debtStatus: 'SIN DEUDA',
      currentDebtAmount: 0,
      expiredDebtAmount: 0
    },
    {
      idGroup: 601,
      code: 11551,
      rut: '96505760-9',
      name: 'COBRANZA COLBUN  S.A  . 1',
      benefitStatus: 'BLOQUEADO',
      debtStatus: 'DEUDA VENCIDA',
      currentDebtAmount: 0,
      expiredDebtAmount: 12275
    }
  ],
  hasBlockedBenefits: true,
  hasDebt: true,
  hasHealthBenefits: true,
  hasPendingRequirements: false,
  insuredList: undefined
};

const insured: IInsured = {
  renewalId: 11068473,
  policyNumber: 281221,
  code: 7466820,
  rut: '9420772-K',
  firstName: 'VICTOR',
  lastName: 'AGUILERA CANDIA',
  birthDate: new Date('1965-08-01T00:00:00'),
  civilStatus: { code: '0', name: null },
  gender: { code: 'M', name: 'MASCULINO' },
  insuredGroup: {
    idGroup: 16925,
    code: 250188,
    name: 'GUARDIAS ARMADOS',
    startDate: new Date('2019-08-01T00:00:00'),
    endDate: new Date('2020-07-31T00:00:00'),
    planCode: 0,
    subsidiaryCode: 7776,
    collectiongGroupCode: 11551
  },
  subsidiary: { code: 7776, rut: '96505760-9', name: 'COLBUN  S.A  .' },
  plan: {
    code: 250188,
    name: 'GUARDIAS ARMADOS',
    requiresCapital: false,
    requiresRent: false,
    products: null
  },
  originalStartDate: new Date('2006-08-01T04:00:00.000Z'),
  startDate: new Date('2019-08-01T04:00:00.000Z'),
  endDate: new Date(),
  capital: 1000,
  rent: 500
};

const detailDummy: IPayrollDetailDTO = {
  creationDate: new Date('2010-05-01'),
  insuredRut: 16813306,
  insuredDV: '5',
  dependentRut: 8990893,
  dependentDV: '0',
  name: 'name',
  lastName: 'lastName',
  birthday: new Date('2015-05-01 15:23'),
  gender: 'M',
  contractDate: moment(new Date()).subtract(20, 'days').toDate(),
  initDate: moment(new Date()).subtract(10, 'days').toDate(),
  endDate: moment(new Date()).add(10, 'days').toDate(),
  income: '30',
  capital: '30',
  email: 'test@test.com',
  bank: '1',
  bankName: 'bankName',
  bankAccountNumber: 123,
  kinship: 'kinship',
  phone: '+56912345678',
  isapre: 'isapre'
};

const payrollDummy: IPayrollDTO = {
  type: PAYROLL_TYPE.VIRTUAL_SUBSCRIPTION,
  typeDescription: 'Suscripción Virtual',
  exclusionType: null,
  policy: 281221,
  contractorRut: '96505760-9',
  contractorName: 'COLBUN  S.A  .',
  subsidiaryRut: '16813306-5',
  subsidiaryName: 'SubName',
  subsidiaryCode: 7776,
  plan: 'plan',
  planCode: '0',
  group: 'group',
  groupName: 'groupName',
  capitalRequired: true,
  incomeRequired: true,
  details: []
};

const beneficiaries: string[] = ['16.813.306-5', '12.123.345-6'];
const serviceResponse: IServiceResponse = {
  code: 0,
  message: 'test',
  success: true
};
const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza], message: '' };

let payroll;
let detail;

describe('payrollService', () => {
  Container.set('logger', logger);
  let payrollService: PayrollService;
  const spyInsertPayrollRepo = jest.spyOn(PayrollRepository.prototype, 'insertPayroll');
  const spyAddPayrollDetailRepo = jest.spyOn(PayrollRepository.prototype, 'addPayrollDetail');
  const spyGetHistoryRepo = jest.spyOn(PayrollRepository.prototype, 'getPayrollsHistoryByEstado');
  const spyUpdatePayroll = jest.spyOn(PayrollRepository.prototype, 'updatePayroll');
  const spylistaPrevisiones = jest.spyOn(CommonService.prototype, 'listaPrevisiones');
  const spylistaBancos = jest.spyOn(CommonService.prototype, 'listaBancos');
  const spyUploadFile = jest.spyOn(AzureStorageRepository.prototype, 'uploadFile');
  const spySendMessageQueue = jest.spyOn(AzureBusClient.prototype, 'sendMessageQueue');
  const spyValidateInclusionInsured = jest.spyOn(PayrollService.prototype as any, 'validateInclusionInsured');
  const spyValidateExclusionInsured = jest.spyOn(PayrollService.prototype as any, 'validateExclusionInsured');
  const spyValidateChangePlan = jest.spyOn(PayrollService.prototype as any, 'validateChangePlan');
  const spyValidateChangeSubsidiary = jest.spyOn(PayrollService.prototype as any, 'validateChangeSubsidiary');
  const spyValidateVirtualSubscription = jest.spyOn(PayrollService.prototype as any, 'validateVirtualSubscription');
  const spyGetPayrollById = jest.spyOn(PayrollRepository.prototype, 'getPayrollById');
  const spyGetFile = jest.spyOn(AzureStorageRepository.prototype, 'getFile');
  const spyVirtualSuscriptionApi = jest.spyOn(SubscriptionsApi.prototype, 'virtualSubscription');
  const spyGetUserData = jest.spyOn(AdministrationRepository.prototype, 'getUserData');
  const spyPoliciesByBroker = jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker');
  const spyPolicyDetail = jest.spyOn(PolicyApi.prototype, 'getPolicyDetail');
  const spyInsuredDetail = jest.spyOn(PolicyApi.prototype, 'getInsuredDetail');
  const spySubsidiaryChange = jest.spyOn(PolicyApi.prototype, 'insuredSubsidiaryChange');
  const spyGroupChange = jest.spyOn(PolicyApi.prototype, 'insuredGroupChange');
  const spyPoliciesByInsured = jest.spyOn(PolicyApi.prototype, 'getPoliciesByInsured');
  const spyExclusionInsured = jest.spyOn(PolicyApi.prototype, 'exclusionInsured');

  beforeEach(() => {
    payroll = clone(payrollDummy);
    detail = clone(detailDummy);
    detail.endDate = new Date(detail.endDate);
    detail.initDate = new Date(detail.initDate);
    detail.creationDate = new Date(detail.creationDate);
    detail.birthday = new Date(detail.birthday);
    detail.contractDate = new Date(detail.contractDate);
  });

  afterAll(() => {
    resetMocks();
  });

  beforeAll(async () => {
    await startGlobals(null, true);
    payrollService = Container.get(PayrollService);
  });

  it('PayrollService be defined', () => {
    expect(payrollService).toBeDefined();
  });

  it('addPayroll VIRTUAL_SUBSCRIPTION_INDIVIDUAL OK', async () => {
    const virtualSubscriptionResp: VirtualSubscriptionResponse = {
      subscriptionCode: 0,
      underWritings: []
    };

    spyGetUserData.mockImplementation(async () => userData);
    spyPoliciesByBroker.mockImplementation(async () => pagedPolicy);
    spyPolicyDetail.mockImplementation(async () => poliza);
    spyInsuredDetail.mockImplementation(async () => null);
    spyInsertPayrollRepo.mockImplementationOnce(async () => payroll);
    spyAddPayrollDetailRepo.mockImplementationOnce(async () => detail);
    spyVirtualSuscriptionApi.mockImplementationOnce(async () => virtualSubscriptionResp);

    const payrollModified = clone(payroll);
    payrollModified.type = PAYROLL_TYPE.VIRTUAL_SUBSCRIPTION_INDIVIDUAL;

    const response = await payrollService.addPayroll(payrollModified, detail, beneficiaries, iUserSSO);
    expect(spyGetUserData).toHaveBeenCalled();
    expect(spyPoliciesByBroker).toHaveBeenCalled();
    expect(spyPolicyDetail).toHaveBeenCalled();
    expect(spyInsuredDetail).toHaveBeenCalled();
    expect(spyInsertPayrollRepo).toHaveBeenCalled();
    expect(spyAddPayrollDetailRepo).toHaveBeenCalled();
    expect(spyVirtualSuscriptionApi).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toBeDefined();
  });

  it('addPayroll CHANGE_AFFILIATE_INDIVIDUAL OK', async () => {
    spyInsertPayrollRepo.mockImplementationOnce(async () => payroll);
    spyAddPayrollDetailRepo.mockImplementationOnce(async () => detail);
    spySubsidiaryChange.mockImplementationOnce(async () => serviceResponse);
    const payrollModified = clone(payroll);
    payrollModified.type = PAYROLL_TYPE.CHANGE_AFFILIATE_INDIVIDUAL;
    detail.initDate = new Date(detail.initDate);

    const response = await payrollService.addPayroll(payrollModified, detail, beneficiaries, iUserSSO);
    expect(spyInsertPayrollRepo).toHaveBeenCalled();
    expect(spyAddPayrollDetailRepo).toHaveBeenCalled();
    expect(spySubsidiaryChange).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toBeDefined();
  });

  it('addPayroll CHANGE_AFFILIATE_INDIVIDUAL Errors', async () => {
    spyInsertPayrollRepo.mockImplementationOnce(async () => payroll);
    spyAddPayrollDetailRepo.mockImplementationOnce(async () => detail);
    spySubsidiaryChange.mockImplementationOnce(async () => serviceResponse);
    const payrollModified = clone(payroll);
    const detailModified = clone(detail);
    payrollModified.subsidiaryRut = '321';
    detailModified.insuredRut = 123;
    detailModified.insuredDV = 'K';
    detailModified.initDate = moment(new Date()).subtract(60, 'days').toDate();
    payrollModified.type = PAYROLL_TYPE.CHANGE_AFFILIATE_INDIVIDUAL;

    const response = await payrollService.addPayroll(payrollModified, detailModified, beneficiaries, iUserSSO);
    expect(response.code).toBe(1);
    expect(response.message).toBe('Error');
    expect(response.data.length > 0).toBeTruthy();
  });

  it('addPayroll CHANGE_PLAN_INDIVIDUAL OK', async () => {
    spyInsertPayrollRepo.mockImplementationOnce(async () => payroll);
    spyAddPayrollDetailRepo.mockImplementationOnce(async () => detail);
    spyGroupChange.mockImplementationOnce(async () => serviceResponse);
    const payrollModified = clone(payroll);
    payrollModified.type = PAYROLL_TYPE.CHANGE_PLAN_INDIVIDUAL;

    const response = await payrollService.addPayroll(payrollModified, detail, beneficiaries, iUserSSO);
    expect(spyInsertPayrollRepo).toHaveBeenCalled();
    expect(spyAddPayrollDetailRepo).toHaveBeenCalled();
    expect(spyGroupChange).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toBeDefined();
  });

  it('addPayroll EXCLUSION_INSURED_INDIVIDUAL EXCLUDE_FROM_ALL OK', async () => {
    spyInsertPayrollRepo.mockImplementationOnce(async () => payroll);
    spyAddPayrollDetailRepo.mockImplementationOnce(async () => detail);
    spyPoliciesByInsured.mockImplementationOnce(async () => pagedPolicy);
    spyGetUserData.mockImplementation(async () => userData);
    spyPoliciesByBroker.mockImplementation(async () => pagedPolicy);
    spyExclusionInsured.mockImplementation(async () => serviceResponse);

    const payrollModified = clone(payroll);
    payrollModified.type = PAYROLL_TYPE.EXCLUSION_INSURED_INDIVIDUAL;
    payrollModified.exclusionType = 'EXCLUDE_FROM_ALL';
    detail.endDate = new Date(detail.endDate);

    const response = await payrollService.addPayroll(payrollModified, detail, beneficiaries, iUserSSO);
    expect(spyInsertPayrollRepo).toHaveBeenCalled();
    expect(spyAddPayrollDetailRepo).toHaveBeenCalled();
    expect(spyPoliciesByInsured).toHaveBeenCalled();
    expect(spyGetUserData).toHaveBeenCalled();
    expect(spyPoliciesByBroker).toHaveBeenCalled();
    expect(spyExclusionInsured).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toBeDefined();
  });

  it('addPayroll EXCLUSION_INSURED_INDIVIDUAL EXCLUDE_FROM_SINGLE OK', async () => {
    spyInsertPayrollRepo.mockImplementationOnce(async () => payroll);
    spyAddPayrollDetailRepo.mockImplementationOnce(async () => detail);
    spyExclusionInsured.mockImplementation(async () => serviceResponse);

    const payrollModified = clone(payroll);
    payrollModified.type = PAYROLL_TYPE.EXCLUSION_INSURED_INDIVIDUAL;
    payrollModified.exclusionType = 'EXCLUDE_FROM_SINGLE';
    detail.endDate = new Date(detail.endDate);

    const response = await payrollService.addPayroll(payrollModified, detail, beneficiaries, iUserSSO);
    expect(spyInsertPayrollRepo).toHaveBeenCalled();
    expect(spyAddPayrollDetailRepo).toHaveBeenCalled();
    expect(spyExclusionInsured).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toBeDefined();
  });

  it('getHistoryPayroll OK', async () => {
    spyGetHistoryRepo.mockImplementation(async () => [payroll, payroll]);

    const response = await payrollService.getHistoryPayrollData(30, 'INCLUSION_INSURED', 1, 10, '16813306-5', null);
    expect(spyGetHistoryRepo).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toHaveLength(2);
  });

  it('createPayroll Inclusiones NOTOK', async () => {
    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Inclusiones_malo.xlsx'));
    const file: IMulterFile = {
      buffer: fileDummy,
      destination: "",
      encoding: "",
      fieldname: "",
      filename: "",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      originalname: "Inclusiones_malo.xlsx",
      path: "",
      size: 0,
      stream: undefined
    };

    const payrollInclusion = clone(payroll);
    payrollInclusion.type = PAYROLL_TYPE.INCLUSION_INSURED;
    payrollInclusion.typeDescription = PAYROLL_TYPE_OPTIONS.INCLUSION_INSURED;
    payrollInclusion.incomeRequired = false;
    payrollInclusion.capitalRequired = true;

    spylistaBancos.mockImplementation(async () => bancosDummy);
    spylistaPrevisiones.mockImplementation(async () => previsionesDummy);
    spyPolicyDetail.mockImplementation(async () => poliza);

    const response = await payrollService.createPayroll(file, payrollInclusion, iUserSSO);
    expect(spylistaBancos).toHaveBeenCalled();
    expect(spylistaPrevisiones).toHaveBeenCalled();
    expect(spyPolicyDetail).toHaveBeenCalled();
    expect(response.code).toBe(1);
    expect(response.message).toBe('Archivo con errores');
    expect(response.data).toBeDefined();
  });

  it('createPayroll Inclusiones OK', async () => {
    const uploadResult = {
      success: true
    };
    const messageResult = false;

    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Inclusiones_bueno.xlsx'));

    const file: IMulterFile = {
      buffer: fileDummy,
      destination: "",
      encoding: "",
      fieldname: "",
      filename: "",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      originalname: "Inclusiones_bueno.xlsx",
      path: "",
      size: 0,
      stream: undefined
    };
    const sinErrores: string[] = [];

    const payrollInclusion = clone(payroll);
    payrollInclusion.type = PAYROLL_TYPE.INCLUSION_INSURED;
    payrollInclusion.typeDescription = PAYROLL_TYPE_OPTIONS.INCLUSION_INSURED;
    payrollInclusion.incomeRequired = false;
    payrollInclusion.capitalRequired = true;

    spylistaBancos.mockImplementation(async () => bancosDummy);
    spylistaPrevisiones.mockImplementation(async () => previsionesDummy);
    spyPolicyDetail.mockImplementation(async () => poliza);
    spyInsertPayrollRepo.mockImplementationOnce(async () => payrollInclusion);
    spyUploadFile.mockImplementationOnce(async () => uploadResult);
    spyUpdatePayroll.mockImplementationOnce(async () => payrollInclusion);
    spySendMessageQueue.mockImplementationOnce(async () => messageResult);
    spyValidateInclusionInsured.mockImplementation(() => sinErrores);

    const response = await payrollService.createPayroll(file, payrollInclusion, iUserSSO);
    expect(spylistaBancos).toHaveBeenCalled();
    expect(spylistaPrevisiones).toHaveBeenCalled();
    expect(spyPolicyDetail).toHaveBeenCalled();
    expect(spyInsertPayrollRepo).toHaveBeenCalled();
    expect(spyUploadFile).toHaveBeenCalled();
    expect(spyUpdatePayroll).toHaveBeenCalled();
    expect(spySendMessageQueue).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toBeDefined();
  });

  it('createPayroll Exclusiones NOTOK', async () => {
    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Exclusiones_malo.xlsx'));

    const file: IMulterFile = {
      buffer: fileDummy,
      destination: "",
      encoding: "",
      fieldname: "",
      filename: "",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      originalname: "Exclusiones_malo.xlsx",
      path: "",
      size: 0,
      stream: undefined
    };

    const payrollInclusion = clone(payroll);
    payrollInclusion.type = PAYROLL_TYPE.EXCLUSION_INSURED;
    payrollInclusion.exclusionType = 'EXCLUDE_FROM_SINGLE';
    payrollInclusion.typeDescription = PAYROLL_TYPE_OPTIONS.EXCLUSION_INSURED;
    payrollInclusion.incomeRequired = false;
    payrollInclusion.capitalRequired = true;

    spylistaBancos.mockImplementation(async () => bancosDummy);
    spylistaPrevisiones.mockImplementation(async () => previsionesDummy);
    spyPolicyDetail.mockImplementation(async () => poliza);

    const response = await payrollService.createPayroll(file, payrollInclusion, iUserSSO);
    expect(spylistaBancos).toHaveBeenCalled();
    expect(spylistaPrevisiones).toHaveBeenCalled();
    expect(spyPolicyDetail).toHaveBeenCalled();
    expect(response.code).toBe(1);
    expect(response.message).toBe('Archivo con errores');
    expect(response.data).toBeDefined();
  });

  it('createPayroll Exclusiones OK', async () => {
    const uploadResult = {
      success: true
    };
    const messageResult = false;

    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Exclusiones_bueno.xlsx'));

    const file: IMulterFile = {
      buffer: fileDummy,
      destination: "",
      encoding: "",
      fieldname: "",
      filename: "",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      originalname: "Exclusiones_bueno.xlsx",
      path: "",
      size: 0,
      stream: undefined
    };

    const sinErrores: string[] = [];

    const payrollInclusion = clone(payroll);
    payrollInclusion.type = PAYROLL_TYPE.EXCLUSION_INSURED;
    payrollInclusion.typeDescription = PAYROLL_TYPE_OPTIONS.EXCLUSION_INSURED;
    payrollInclusion.incomeRequired = false;
    payrollInclusion.capitalRequired = true;
    payrollInclusion.exclusionType = 'EXCLUDE_FROM_SINGLE';

    spylistaBancos.mockImplementation(async () => bancosDummy);
    spylistaPrevisiones.mockImplementation(async () => previsionesDummy);
    spyInsertPayrollRepo.mockImplementationOnce(async () => payrollInclusion);
    spyPolicyDetail.mockImplementation(async () => poliza);
    spyUploadFile.mockImplementationOnce(async () => uploadResult);
    spyUpdatePayroll.mockImplementationOnce(async () => payrollInclusion);
    spySendMessageQueue.mockImplementationOnce(async () => messageResult);
    spyValidateExclusionInsured.mockImplementation(() => sinErrores);

    const response = await payrollService.createPayroll(file, payrollInclusion, iUserSSO);
    expect(spylistaBancos).toHaveBeenCalled();
    expect(spylistaPrevisiones).toHaveBeenCalled();
    expect(spyInsertPayrollRepo).toHaveBeenCalled();
    expect(spyPolicyDetail).toHaveBeenCalled();
    expect(spyUploadFile).toHaveBeenCalled();
    expect(spyUpdatePayroll).toHaveBeenCalled();
    expect(spySendMessageQueue).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toBeDefined();
  });

  it('createPayroll Cambio Plan NOTOK', async () => {
    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Cambio_plan_malo.xlsx'));

    const file: IMulterFile = {
      buffer: fileDummy,
      destination: "",
      encoding: "",
      fieldname: "",
      filename: "",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      originalname: "Cambio_plan_malo.xlsx",
      path: "",
      size: 0,
      stream: undefined
    };

    const payrollInclusion = clone(payroll);
    payrollInclusion.type = PAYROLL_TYPE.CHANGE_PLAN;
    payrollInclusion.typeDescription = PAYROLL_TYPE_OPTIONS.CHANGE_PLAN;
    payrollInclusion.incomeRequired = false;
    payrollInclusion.capitalRequired = true;

    spylistaBancos.mockImplementation(async () => bancosDummy);
    spylistaPrevisiones.mockImplementation(async () => previsionesDummy);
    spyPolicyDetail.mockImplementation(async () => poliza);

    const response = await payrollService.createPayroll(file, payrollInclusion, iUserSSO);
    expect(spylistaBancos).toHaveBeenCalled();
    expect(spylistaPrevisiones).toHaveBeenCalled();
    expect(spyPolicyDetail).toHaveBeenCalled();
    expect(response.code).toBe(1);
    expect(response.message).toBe('Archivo con errores');
    expect(response.data).toBeDefined();
  });

  it('createPayroll Cambio Plan OK', async () => {
    const uploadResult = {
      success: true
    };
    const messageResult = false;

    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Cambio_plan_bueno.xlsx'));

    const file: IMulterFile = {
      buffer: fileDummy,
      destination: "",
      encoding: "",
      fieldname: "",
      filename: "",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      originalname: "Cambio_plan_bueno.xlsx",
      path: "",
      size: 0,
      stream: undefined
    };

    const sinErrores: string[] = [];

    const payrollInclusion = clone(payroll);
    payrollInclusion.type = PAYROLL_TYPE.CHANGE_PLAN;
    payrollInclusion.typeDescription = PAYROLL_TYPE_OPTIONS.CHANGE_PLAN;
    payrollInclusion.incomeRequired = false;
    payrollInclusion.capitalRequired = true;

    spylistaBancos.mockImplementation(async () => bancosDummy);
    spylistaPrevisiones.mockImplementation(async () => previsionesDummy);
    spyPolicyDetail.mockImplementation(async () => poliza);
    spyInsertPayrollRepo.mockImplementationOnce(async () => payrollInclusion);
    spyUploadFile.mockImplementationOnce(async () => uploadResult);
    spyUpdatePayroll.mockImplementationOnce(async () => payrollInclusion);
    spySendMessageQueue.mockImplementationOnce(async () => messageResult);
    spyValidateChangePlan.mockImplementation(() => sinErrores);

    const response = await payrollService.createPayroll(file, payrollInclusion, iUserSSO);
    expect(spylistaBancos).toHaveBeenCalled();
    expect(spylistaPrevisiones).toHaveBeenCalled();
    expect(spyPolicyDetail).toHaveBeenCalled();
    expect(spyInsertPayrollRepo).toHaveBeenCalled();
    expect(spyUploadFile).toHaveBeenCalled();
    expect(spyUpdatePayroll).toHaveBeenCalled();
    expect(spySendMessageQueue).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toBeDefined();
  });

  it('createPayroll Cambio Filial NOTOK', async () => {
    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Cambio_plan_malo.xlsx'));
    const file: IMulterFile = {
      buffer: fileDummy,
      destination: "",
      encoding: "",
      fieldname: "",
      filename: "",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      originalname: "Cambio_plan_malo.xlsx",
      path: "",
      size: 0,
      stream: undefined
    };
    const payrollInclusion = clone(payroll);
    payrollInclusion.type = PAYROLL_TYPE.CHANGE_AFFILIATE;
    payrollInclusion.typeDescription = PAYROLL_TYPE_OPTIONS.CHANGE_AFFILIATE;
    payrollInclusion.incomeRequired = false;
    payrollInclusion.capitalRequired = true;

    spylistaBancos.mockImplementation(async () => bancosDummy);
    spylistaPrevisiones.mockImplementation(async () => previsionesDummy);
    spyPolicyDetail.mockImplementation(async () => poliza);

    const response = await payrollService.createPayroll(file, payrollInclusion, iUserSSO);
    expect(spylistaBancos).toHaveBeenCalled();
    expect(spylistaPrevisiones).toHaveBeenCalled();
    expect(spyPolicyDetail).toHaveBeenCalled();
    expect(response.code).toBe(1);
    expect(response.message).toBe('Archivo con errores');
    expect(response.data).toBeDefined();
  });

  it('createPayroll Cambio Filial OK', async () => {
    const uploadResult = {
      success: true
    };
    const messageResult = false;

    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Cambio_filial_bueno.xlsx'));

    const file: IMulterFile = {
      buffer: fileDummy,
      destination: "",
      encoding: "",
      fieldname: "",
      filename: "",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      originalname: "Cambio_filial_bueno.xlsx",
      path: "",
      size: 0,
      stream: undefined
    };
    const sinErrores: string[] = [];

    const payrollInclusion = clone(payroll);
    payrollInclusion.type = PAYROLL_TYPE.CHANGE_AFFILIATE;
    payrollInclusion.typeDescription = PAYROLL_TYPE_OPTIONS.CHANGE_AFFILIATE;
    payrollInclusion.incomeRequired = false;
    payrollInclusion.capitalRequired = true;

    spylistaBancos.mockImplementation(async () => bancosDummy);
    spylistaPrevisiones.mockImplementation(async () => previsionesDummy);
    spyPolicyDetail.mockImplementation(async () => poliza);
    spyInsertPayrollRepo.mockImplementationOnce(async () => payrollInclusion);
    spyUploadFile.mockImplementationOnce(async () => uploadResult);
    spyUpdatePayroll.mockImplementationOnce(async () => payrollInclusion);
    spySendMessageQueue.mockImplementationOnce(async () => messageResult);
    spyValidateChangeSubsidiary.mockImplementation(() => sinErrores);

    const response = await payrollService.createPayroll(file, payrollInclusion, iUserSSO);
    expect(spylistaBancos).toHaveBeenCalled();
    expect(spylistaPrevisiones).toHaveBeenCalled();
    expect(spyPolicyDetail).toHaveBeenCalled();
    expect(spyInsertPayrollRepo).toHaveBeenCalled();
    expect(spyUploadFile).toHaveBeenCalled();
    expect(spyUpdatePayroll).toHaveBeenCalled();
    expect(spySendMessageQueue).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toBeDefined();
  });

  it('createPayroll Suscripcion Virtual NOTOK', async () => {
    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Suscripcion_Virtual_Malo.xlsx'));

    const file: IMulterFile = {
      buffer: fileDummy,
      destination: "",
      encoding: "",
      fieldname: "",
      filename: "",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      originalname: "Suscripcion_Virtual_Malo.xlsx",
      path: "",
      size: 0,
      stream: undefined
    };
    const payrollInclusion = clone(payroll);
    payrollInclusion.type = PAYROLL_TYPE.VIRTUAL_SUBSCRIPTION;
    payrollInclusion.typeDescription = PAYROLL_TYPE_OPTIONS.VIRTUAL_SUBSCRIPTION;
    payrollInclusion.incomeRequired = false;
    payrollInclusion.capitalRequired = true;

    spylistaBancos.mockImplementation(async () => bancosDummy);
    spylistaPrevisiones.mockImplementation(async () => previsionesDummy);
    spyPolicyDetail.mockImplementation(async () => poliza);

    const response = await payrollService.createPayroll(file, payrollInclusion, iUserSSO);
    expect(spylistaBancos).toHaveBeenCalled();
    expect(spylistaPrevisiones).toHaveBeenCalled();
    expect(spyPolicyDetail).toHaveBeenCalled();
    expect(response.code).toBe(1);
    expect(response.message).toBe('Archivo con errores');
    expect(response.data).toBeDefined();
  });

  /*
  it('createPayroll Suscripcion Virtual OK', async () => {
    const uploadResult = {
      success: true,
    };
    const messageResult = false;

    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Suscripcion_Virtual.xlsx'));
    const file = {
      buffer: fileDummy,
      originalname: 'Suscripcion_Virtual.xlsx',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const sinErrores: string[] = [];

    const payrollInclusion = clone(payroll);
    payrollInclusion.type = PAYROLL_TYPE.VIRTUAL_SUBSCRIPTION;
    payrollInclusion.typeDescription = PAYROLL_TYPE_OPTIONS.VIRTUAL_SUBSCRIPTION;
    payrollInclusion.incomeRequired = false;
    payrollInclusion.capitalRequired = true;

    spygetBancos.mockImplementation(async () => bancosDummy);
    spylistaPrevisiones.mockImplementation(async () => previsionesDummy);
    spyInsertPayroll.mockImplementationOnce(async () => payrollInclusion);
    spyUploadFile.mockImplementationOnce(async () => uploadResult);
    spyUpdatePayroll.mockImplementationOnce(async () => payrollInclusion);
    spySendMessageQueue.mockImplementationOnce(async () => messageResult);
    spyValidateVirtualSubscription.mockImplementation(() => sinErrores);

    const response = await payrollService.createPayroll(file, payrollInclusion, clientUserResponse);
    expect(spygetBancos).toHaveBeenCalled();
    expect(spylistaPrevisiones).toHaveBeenCalled();
    expect(spyInsertPayroll).toHaveBeenCalled();
    expect(spyUploadFile).toHaveBeenCalled();
    expect(spyUpdatePayroll).toHaveBeenCalled();
    expect(spySendMessageQueue).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
    expect(response.data).toBeDefined();
  });

  it('downloadPayrollFile OK', async () => {
    const fileMockD = Buffer.from('');

    spyGetPayrollById.mockImplementation(async () => payroll);

    spyGetFile.mockImplementation(async () => fileMockD);

    const response = await payrollService.downloadPayrollFile(1, clientUserResponse);
    expect(spyGetPayrollById).toHaveBeenCalled();
    expect(spyGetFile).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });*/
});
