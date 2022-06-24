import { Container } from 'typedi';
import DenounceService from '../../src/application/services/denounceService';
import logger from '../../src/loaders/logger';
import { IDenounceDTO, IDenounceFileRouteDTO } from '../../src/domain/interfaces/dto/v1/IDenounce';
import { IDenounceSearchRequestDTO } from '../../src/domain/interfaces/dto/v1/IDenounce';
import { IResponseDTO } from '../../src/utils/interfaces/IResponse';
import moment from 'moment';
import rutjs from 'rut.js';

import { resetMocks, startGlobals } from '../helpers/globalMocks';
import { iUserSSO } from '../helpers/globalMocks';
import {
  IDenounceAppForm,
  IDenounceApplicationDTO,
  IDenounceAppBeneficiaryDTO,
  IDenounceAppPolicyDTO
} from '../../src/domain/interfaces/dto/v1/IDenounceApplication';
import DenounceRepository from '../../src/infrastructure/database/denounceRepository';
import AzureBusClient from '../../src/infrastructure/clients/azureBusClient';
import { IDenounceFileDTO } from '../../src/domain/interfaces/dto/v1/IDenounceFile';
import AdministrationRepository from '../../src/infrastructure/database/administrationRepository';
import { DENOUNCE_APPLICATION_STATUS } from '../../src/constants/status';
import AzureStorageRepository from '../../src/infrastructure/repositories/azureStorageRepository';
import ClaimsApi from '../../src/infrastructure/clients/claimsApi';
import { IPagedResponse } from '../../src/domain/interfaces/dto/v1/IResponse';
import { IUserDTO } from '../../src/domain/interfaces/dto/administration/IUserDTO';
import { IDenounce, IDenounceDetail } from '../../src/domain/interfaces/dto/v3/IDenounce';
import { ILegalPerson } from '../../src/domain/interfaces/dto/v3/ILegalPerson';
import PolicyApi from '../../src/infrastructure/clients/policyApi';
import { IPolicy } from '../../src/domain/interfaces/dto/v3/IPolicy';
import { IInsured } from '../../src/domain/interfaces/dto/v3/IInsured';
import { HealthBeneficiary } from '../../src/domain/interfaces/dto/v3/IHealthBeneficiary';
import { IPaymentTypeDetail } from '../../src/domain/interfaces/dto/v3/IPaymentDetail';
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

const applicationNumber = 28306064564;

const insured: ILegalPerson = {
  rut: 9420772,
  dv: 'K',
  name: 'VICTOR AGUILERA CANDIA'
};

const beneficiary: ILegalPerson = {
  rut: 13903510,
  dv: '1',
  name: 'JOSE ALBERTO BADILLA SOBARZO'
};

const broker: ILegalPerson = {
  rut: 78734410,
  dv: '0',
  name: 'DE SEGUROS LTDA. MERCER CORREDORES'
};

const company: ILegalPerson = {
  rut: 96505760,
  dv: '9',
  name: 'COLBUN  S.A  .'
};

const requestObjDenounce: IDenounceSearchRequestDTO = {
  consignment: 'BATCHCV_ADJ_4054620',
  applicationNumber: 445107,
  policy: 281221,
  insuredRut: '13507724',
  contractorRut: '70016330-K',
  codeDate: 300,
  status: 'APROBADO',
  onlyMine: true
};

const denounces: IDenounce[] = [];
denounces.push({
  consignment: 'BATCHCIMED553234682-96661547',
  applicationNumber: applicationNumber,
  policy: 281221,
  plan: 'SALUD/DENTAL BASE',
  startDateContract: moment('2020-01-01').toDate(),
  endDateContract: moment('2020-12-31').toDate(),
  firstTerm: moment('2020-01-01').toDate(),
  changeFactor: 28469.54,
  denounceDate: moment('2020-03-01').toDate(),
  liquidationDate: moment('2020-03-01').toDate(),
  insured: insured,
  beneficiary: beneficiary,
  status: 'Pagado',
  denounceUser: rutjs.format('11.111.111-1'),
  broker: broker,
  company: company,
  amountClaim: 28700,
  amountPay: 28700,
  observation: 'Esto es una observación'
});
denounces.push({
  consignment: 'BATCHCIMED553234682-96661547',
  applicationNumber: 28306064564,
  policy: 281221,
  plan: 'SALUD/DENTAL BASE',
  startDateContract: moment('2020-01-01').toDate(),
  endDateContract: moment('2020-12-31').toDate(),
  firstTerm: moment('2020-01-01').toDate(),
  changeFactor: 28469.54,
  denounceDate: moment('2020-03-01').toDate(),
  liquidationDate: moment('2020-03-01').toDate(),
  insured: insured,
  beneficiary: beneficiary,
  status: 'Pagado',
  denounceUser: rutjs.format('11.111.111-1'),
  broker: broker,
  company: company,
  amountClaim: 28700,
  amountPay: 28700,
  observation: 'Esto es una observación'
});
denounces.push({
  consignment: 'BATCHCIMED553234682-96661547',
  applicationNumber: 28306064564,
  policy: 281221,
  plan: 'SALUD/DENTAL BASE',
  startDateContract: moment('2020-01-01').toDate(),
  endDateContract: moment('2020-12-31').toDate(),
  firstTerm: moment('2020-01-01').toDate(),
  changeFactor: 28469.54,
  denounceDate: moment('2020-03-01').toDate(),
  liquidationDate: moment('2020-03-01').toDate(),
  insured: insured,
  beneficiary: beneficiary,
  status: 'Pagado',
  denounceUser: rutjs.format('11.111.111-1'),
  broker: broker,
  company: company,
  amountClaim: 28700,
  amountPay: 28700,
  observation: 'Esto es una observación'
});

const denounceDetail: IDenounceDetail = {
  denounce: denounces[0],
  benefits: [
    {
      name: 'Beneficio1',
      claimDate: new Date('2020-01-01T00:00:00'),
      totalExpenses: 120,
      isapreContribution: 70,
      changesAmount: 30000,
      bmiAmount: 30000,
      coveragePercentage: 70,
      base: 10000,
      deductible: 1,
      refund: 1,
      code: 1,
      deductibles: null
    }
  ],
  deductibles: [
    {
      concept: 'Salud',
      individualAccRefund: '21,471989030767',
      familyAccRefund: '40,2428405156465',
      individalPrevDeductible: '1,4999868968168',
      familyPrevDeductible: '7,09333248116927',
      individualAccDeductible: '1,5',
      familyAccDeductible: '7,09333248116927',
      individualAnnualDeductible: '1,4999868968168',
      familyAnnualDeductible: '7,09333248116927',
      annualLimit: '0'
    }
  ],
  paymentType: {
    uf: 29000,
    type: 'DEPOSITO',
    bankName: 'BCI',
    bankAccount: '12568222',
    costCenter: ''
  }
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

const insuredDetail: IInsured = {
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
  rent: 500,
  familyGroup: { dependent: [] },
  accountBank: {
    bank: { code: '0', name: ' ' },
    accountType: { code: '1', name: 'CUENTA CORRIENTE' },
    accountNumber: null
  },
  contactInfo: {
    address: 'string;',
    commune: { code: '0', name: ' ' },
    city: { code: '0', name: ' ' },
    region: { code: '0', name: ' ' },
    emailAddress: 'string;',
    phoneNumber: 'string;',
    cellPhone: 'string;'
  },
  isapre: { code: '0', name: ' ' }
};

const denounceAppPolicies: IDenounceAppPolicyDTO[] = [];
denounceAppPolicies.push({
  policyCode: '12345',
  planCode: '',
  planName: '',
  policyNumber: '12345'
});

const denounceAppBeneficiaries: IDenounceAppBeneficiaryDTO[] = [];
denounceAppBeneficiaries.push({
  dependentName: 'name',
  dependentRut: 'rutDependent',
  plans: denounceAppPolicies
});

const denounceAppForm: IDenounceAppForm[] = [];
denounceAppForm.push({
  beneficiaries: denounceAppBeneficiaries,
  denounceType: 'a',
  denounceTypeCode: 'a'
});

const denounceApp: IDenounceApplicationDTO = {
  insuredEmail: '',
  insuredName: '',
  insuredRut: '',
  insuredLastname: '',
  status: '',
  userName: '',
  userRut: '',
  userEmail: ''
};

const denounceAppList: IDenounceApplicationDTO[] = [];
denounceAppList.push(denounceApp);

const fileResponse: IDenounceFileDTO = {
  denounceApplicationID: 1,
  extension: '',
  mimeType: '',
  name: ''
};

const fileResponseList: IDenounceFileDTO[] = [];
fileResponseList.push(fileResponse);

describe('DenounceService', () => {
  Container.set('logger', logger);
  let denounceService: DenounceService;

  beforeAll(async () => {
    await startGlobals(null, true);
    denounceService = Container.get(DenounceService);
  });
  afterAll(() => {
    resetMocks();
  });

  it('DenounceService be defined', () => {
    expect(denounceService).toBeDefined();
  });

  it('searchInsuredDenounces OK', async () => {
    const pagedDenounces: IPagedResponse<IDenounce> = {
      code: 0,
      data: denounces,
      message: '',
      recordTotal: denounces.length
    };

    jest.spyOn(ClaimsApi.prototype, 'getDenouncesByPolicy').mockImplementation(async () => pagedDenounces);

    const policyNumber = 282632;
    const insuredRut = '10726792-1';
    const monthRangeDate = 4;
    const page = 1;
    const limit = 5;

    const resp: IResponseDTO = await denounceService.searchInsuredDenounces(
      policyNumber,
      insuredRut,
      monthRangeDate,
      page,
      limit,
      iUserSSO
    );
    expect(resp.recordTotal).toBe(3);
  });

  it('findDenounce OK', async () => {
    jest.spyOn(ClaimsApi.prototype, 'getClaimDetail').mockImplementation(async () => denounceDetail);

    const resp: IDenounceDTO = await denounceService.findDenounce(applicationNumber, iUserSSO);
    expect(resp.applicationNumber).toBe(applicationNumber);
  });

  it('Genera Denounce XLS', async () => {
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza], message: '' };

    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy);
    jest.spyOn(ClaimsApi.prototype, 'getClaimDetail').mockImplementation(async () => denounceDetail);

    const resp = await denounceService.generateXLSDenounce(iUserSSO, requestObjDenounce);

    expect(resp).toBeInstanceOf(Buffer);
  });

  it('getDenounceApplicationForm por rut asegurado OK', async () => {
    const insuredRut = '9420772-K';
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza], message: '' };
    const healtBeneficiaries: HealthBeneficiary[] = [
      {
        beneficiary: {
          dv: '1',
          name: 'FRANCISCO JAVIER-ALTIMIRAS GONZALEZ',
          rut: 16419646,
          correlative: null,
          relacion: 'HIJO'
        },
        planBeneficiaries: { code: 1, name: 'SALUD/DENTAL', claimTypes: [{ code: '2', name: 'DENTAL' }] },
        policy: { renewalIdtrassa: 11068473, policyNumber: 281221 }
      }
    ];

    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByInsured').mockImplementation(async () => pagedPolicy);
    jest.spyOn(PolicyApi.prototype, 'getInsuredDetail').mockImplementation(async () => insuredDetail);
    jest.spyOn(ClaimsApi.prototype, 'getHealthBeneficiaries').mockImplementation(async () => healtBeneficiaries);
    jest.spyOn(DenounceRepository.prototype, 'insertDenounce').mockImplementation(async () => denounceApp);

    const response: IResponseDTO = await denounceService.getDenounceApplicationForm(insuredRut, null, iUserSSO);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('getDenounceApplicationForm no posee polizas validas NOTOK', async () => {
    const insuredRut = '13507724';
    const poliza2 = clone(poliza);
    poliza2.hasHealthBenefits = false;
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza2], message: '' };

    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByInsured').mockImplementation(async () => pagedPolicy);

    const response: IResponseDTO = await denounceService.getDenounceApplicationForm(insuredRut, null, iUserSSO);
    expect(response.code).toBe(1);
    expect(response.message).toBe('El rut ingresado no posee polizas validas para realizar denuncio');
  });

  it('deleteDenounceApplication OK', async () => {
    const deleteResponse = { code: 0, message: 'OK' };

    jest.spyOn(DenounceRepository.prototype, 'getFileList').mockImplementation(async () => fileResponseList);
    jest.spyOn(AzureStorageRepository.prototype, 'deleteFile').mockImplementation(async () => deleteResponse);
    jest.spyOn(DenounceRepository.prototype, 'deleteDenounceById').mockImplementation(async () => deleteResponse);

    const response: IResponseDTO = await denounceService.deleteDenounceApplication(1, iUserSSO.preferredUsername);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('createDenounceApplication OK', async () => {
    const respUpdate = { code: 0, message: 'OK' };

    jest.spyOn(DenounceRepository.prototype, 'updateDenounce').mockImplementation(async () => respUpdate);
    jest.spyOn(DenounceRepository.prototype, 'updateFiles').mockImplementation(async () => respUpdate);
    jest.spyOn(AzureBusClient.prototype, 'sendMessageQueue').mockImplementation(async () => false);
    jest.spyOn(DenounceRepository.prototype, 'getDenounceApp').mockImplementation(async () => denounceApp);

    const response: IDenounceApplicationDTO = await denounceService.createDenounceApplication(denounceApp, iUserSSO);
    expect(response.status).toBe(DENOUNCE_APPLICATION_STATUS.EN_PROCESO);
  });

  it('createDenounceFile OK', async () => {
    const insertResponse: IDenounceFileDTO = {
      denounceApplicationID: 1,
      extension: '',
      mimeType: '',
      name: ''
    };

    jest.spyOn(DenounceRepository.prototype, 'insertFile').mockImplementation(async () => insertResponse);

    const response: IResponseDTO = await denounceService.createDenounceFile(insertResponse);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('searchDenounces buscador universal OK', async () => {
    const searchRequest: IDenounceSearchRequestDTO = {
      page: 1,
      limit: 5
    };
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza], message: '' };
    const pagedDenounces: IPagedResponse<IDenounce> = { code: 0, data: denounces, message: '' };

    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy);
    jest.spyOn(ClaimsApi.prototype, 'getClaimDetail').mockImplementation(async () => denounceDetail);
    jest.spyOn(ClaimsApi.prototype, 'getDenouncesByRemittanceId').mockImplementation(async () => pagedDenounces);

    const response: IResponseDTO = await denounceService.searchDenounces(iUserSSO, '305814091', searchRequest);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('searchDenounces por nro remesa OK', async () => {
    const searchRequest1: IDenounceSearchRequestDTO = {
      page: 1,
      limit: 5,
      consignment: 'BATCHCIMED553234682-96661547'
    };
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };
    const pagedDenounces: IPagedResponse<IDenounce> = { code: 0, data: denounces, message: '' };

    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy);
    jest.spyOn(ClaimsApi.prototype, 'getDenouncesByRemittanceId').mockImplementation(async () => pagedDenounces);

    const response: IResponseDTO = await denounceService.searchDenounces(iUserSSO, null, searchRequest1);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('searchDenounces por nro poliza OK', async () => {
    const searchReques2: IDenounceSearchRequestDTO = {
      page: 1,
      limit: 5,
      policy: 281221
    };
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };
    const pagedDenounces: IPagedResponse<IDenounce> = { code: 0, data: denounces, message: '' };

    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy);
    jest.spyOn(ClaimsApi.prototype, 'getDenouncesByPolicy').mockImplementation(async () => pagedDenounces);

    const response: IResponseDTO = await denounceService.searchDenounces(iUserSSO, null, searchReques2);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('searchDenounces por rut asegurado BROKER OK', async () => {
    const searchRequest: IDenounceSearchRequestDTO = {
      page: 1,
      limit: 5,
      insuredRut: '9420772-K'
    };
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };
    const pagedDenounces: IPagedResponse<IDenounce> = { code: 0, data: denounces, message: '' };

    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy);
    jest.spyOn(ClaimsApi.prototype, 'getDenouncesByBrokerAndInsured').mockImplementation(async () => pagedDenounces);

    const response: IResponseDTO = await denounceService.searchDenounces(iUserSSO, null, searchRequest);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('searchDenounces por rut asegurado COMPANY OK', async () => {
    const clonedUserData = clone(userData);
    clonedUserData.clients[0].type = 1;
    const searchRequest: IDenounceSearchRequestDTO = {
      page: 1,
      limit: 5,
      insuredRut: '9420772-K'
    };
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };
    const pagedDenounces: IPagedResponse<IDenounce> = { code: 0, data: denounces, message: '' };

    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => clonedUserData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByCompany').mockImplementation(async () => pagedPolicy);
    jest.spyOn(ClaimsApi.prototype, 'getDenouncesByCompanyAndInsured').mockImplementation(async () => pagedDenounces);

    const response: IResponseDTO = await denounceService.searchDenounces(iUserSSO, null, searchRequest);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('searchDenounces por rut compania OK', async () => {
    const searchRequest: IDenounceSearchRequestDTO = {
      page: 1,
      limit: 5,
      contractorRut: '96505760-9'
    };
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };
    const pagedDenounces: IPagedResponse<IDenounce> = { code: 0, data: denounces, message: '' };

    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy);
    jest.spyOn(ClaimsApi.prototype, 'getDenouncesByCompanyAndInsured').mockImplementation(async () => pagedDenounces);

    const response: IResponseDTO = await denounceService.searchDenounces(iUserSSO, null, searchRequest);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('createDenounceApplicationList OK', async () => {
    const respUpdate = { code: 0, message: 'OK' };

    jest.spyOn(DenounceRepository.prototype, 'updateDenounce').mockImplementation(async () => respUpdate);
    jest.spyOn(DenounceRepository.prototype, 'updateFiles').mockImplementation(async () => respUpdate);
    jest.spyOn(AzureBusClient.prototype, 'sendMessageQueue').mockImplementation(async () => false);
    jest.spyOn(DenounceRepository.prototype, 'getDenounceApp').mockImplementation(async () => denounceApp);
    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);

    const response: IDenounceApplicationDTO[] = await denounceService.createDenounceApplicationList(
      denounceAppList,
      iUserSSO
    );
    expect(response[0].status).toBe(DENOUNCE_APPLICATION_STATUS.EN_PROCESO);
  });

  it('deleteDenounceApplicationList OK', async () => {
    const idAppDenounceList: number[] = [234, 2345];
    const respUpdate = { code: 0, message: 'OK' };

    jest.spyOn(DenounceRepository.prototype, 'getFileList').mockImplementation(async () => fileResponseList);
    jest.spyOn(AzureStorageRepository.prototype, 'deleteFile').mockImplementation(async () => respUpdate);
    jest.spyOn(DenounceRepository.prototype, 'deleteDenounceById').mockImplementation(async () => respUpdate);

    const response: IResponseDTO = await denounceService.deleteDenounceApplicationList(
      idAppDenounceList,
      iUserSSO.preferredUsername
    );
    expect(response.code).toBe(0);
  });

  it('finDenounceFiles OK', async () => {
    const file: IDenounceFileRouteDTO = {
      id: 1,
      name: '2345_1.pdf',
      route:
        'http://www.valueweb.cl/DocuWare/PlatformRO/WebClient/Client/Document?did=5906374&fc=ea0efcb5-9a23-430b-8b30-05fbb563eaca&orgId=1&_auth=D6027169B0B6E75D652D40527A40D32736307BBD74ED5CDC58229DBC3F34187A71620D926642ABA3A9BE7153A9C28DE35AE784842F2B2D6FFB20787FED34D14A98984C79D0E51A4874FF149B701FF36F06ACF0BB60B1C52F6F729112604426AA0833F75082A67A7637D29094C1867E66A485CE09C3875FD065FEBCAB4356B93BA36C00878298AE2994C3276F35FAC27095C8742754E44487C89AF2D3FF0C6DC62FC5030201D240CE0F9B9C5FA3300D279BD4CC9AB515D06EFF2EAC7194092AF8F6946ED6FBCA1DE241A6DCFFC2B467D283E82E9D3554829AC24B6D8E0C6B236BA71D47DF238B7C11EB4141557AE9EF87'
    };
    jest.spyOn(ClaimsApi.prototype, 'getBackupDocs').mockImplementation(async () => [file]);
    const response: IResponseDTO = await denounceService.findDenounceFiles(2345, iUserSSO);
    expect(response.code).toBe(0);
  });

  it('getDenounceApplicationForm no existe o no es de la cartera NOTOK', async () => {
    const insuredRut = '13507724';
    const pagedPolicy2: IPagedResponse<IPolicy> = { code: 0, data: [], message: '' };

    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByInsured').mockImplementation(async () => pagedPolicy2);

    const response: IResponseDTO = await denounceService.getDenounceApplicationForm(insuredRut, null, iUserSSO);
    expect(response.code).toBe(1);
    expect(response.message).toBe('Asegurado no existe, o no es de la cartera del usuario');
  });

  it('getPolicyPaymentDetail OK', async () => {
    const policyNumber = 282632;
    const pagedInsured: IPagedResponse<IInsured> = { code: 0, data: [insuredDetail], message: '' };
    const paymentDetail: IPaymentTypeDetail[] = [
      {
        bank: { code: '0', name: '[SIN DEFINIR]' },
        bankTypeAccount: { code: '1', name: 'CUENTA CORRIENTE' },
        codigo: 96532330,
        cuenta: '746576746',
        destinatario: 'CMPC PULP SPA'
      }
    ];

    jest.spyOn(ClaimsApi.prototype, 'getPaymentDetails').mockImplementation(async () => paymentDetail);
    jest.spyOn(PolicyApi.prototype, 'getInsuredsByPolicy').mockImplementation(async () => pagedInsured);

    const response: IResponseDTO = await denounceService.getPolicyPaymentDetail(policyNumber, iUserSSO);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('getLastDenounceDate OK', async () => {
    const insuredRut = '9420772-K';
    const contractorRut = '96505760-9';
    const policyNumber = 282632;
    const pagedDenounces: IPagedResponse<IDenounce> = { code: 0, data: denounces, message: '' };

    jest.spyOn(ClaimsApi.prototype, 'getDenouncesByPolicy').mockImplementation(async () => pagedDenounces);

    const response: IResponseDTO = await denounceService.getLastDenounceDate(
      insuredRut,
      contractorRut,
      policyNumber,
      iUserSSO
    );
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('getLastDenounceDate sin poliza OK', async () => {
    const insuredRut = '9420772-K';
    const contractorRut = '96505760-9';
    const pagedDenounces: IPagedResponse<IDenounce> = { code: 0, data: denounces, message: '' };

    jest.spyOn(ClaimsApi.prototype, 'getDenouncesByCompanyAndInsured').mockImplementation(async () => pagedDenounces);

    const response: IResponseDTO = await denounceService.getLastDenounceDate(insuredRut, contractorRut, null, iUserSSO);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });
});
