import { iUserSSO, resetMocks, startGlobals } from '../helpers/globalMocks';
import { Container } from 'typedi';
import PolicyService from '../../src/application/services/policyService';
import logger from '../../src/loaders/logger';
import AdministrationRepo from '../../src/infrastructure/database/administrationRepository';
import { IPaymentV1 } from '../../src/domain/interfaces/dto/v1/IPayment';
import PolicyApi from '../../src/infrastructure/clients/policyApi';
import { IPolicy } from '../../src/domain/interfaces/dto/v3/IPolicy';
import CustomerApi from '../../src/infrastructure/clients/customerApi';
import { IClient } from '../../src/domain/interfaces/dto/v3/IClient';
import { IPagedResponse, IResponseDTO } from '../../src/domain/interfaces/dto/v1/IResponse';
import { IUserDTO } from '../../src/domain/interfaces/dto/administration/IUserDTO';
import { IInsured } from '../../src/domain/interfaces/dto/v3/IInsured';
import moment from 'moment';
import { clone } from "../../src/utils/utils";

const userData: IUserDTO = {
  clients: [
    {
      name: 'COLBUN  S.A',
      policies: ['1', '2'],
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
  hasHealthBenefits: false,
  hasPendingRequirements: false,
  insuredList: undefined
};

const clientDetail: IClient = {
  activity: ' ',
  address: {
    type: 'MATRIZ',
    adress: 'AV. APOQUINDO N° 4.775',
    city: 'LAS CONDES',
    phoneNumber: '0'
  },
  businessActivity: null,
  code: 7776,
  contacts: [],
  rut: '96505760-9',
  socialName: 'COLBUN  S.A  .'
};

const accountList: IPaymentV1[] = [];
accountList.push({
  accountNumber: '266536564',
  costCenter: null,
  bank: 'Banco de Chile',
  deposit: null,
  paymentMethod: null,
  accountType: 'Cta Corriente',
  id: 64536345
});

const cashiercheckList: IPaymentV1[] = [];
cashiercheckList.push({
  accountNumber: '5353634653',
  costCenter: null,
  bank: 'Banco Santander',
  deposit: null,
  paymentMethod: null,
  accountType: 'Cta Corriente',
  id: 58778,
  namedAtCashierCheck: 'Carolina Herrera'
});

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

describe('policyService', () => {
  Container.set('logger', logger);
  let policyService: PolicyService;

  beforeAll(async () => {
    await startGlobals(null, true);
    policyService = Container.get(PolicyService);
  });
  afterAll(() => {
    resetMocks();
  });

  it('PolicyService be defined', () => {
    expect(policyService).toBeDefined();
  });

  it('getPolicyFile OK', async () => {
    jest.spyOn(PolicyApi.prototype, 'getPolicyDetail').mockImplementation(async () => poliza);
    jest.spyOn(CustomerApi.prototype, 'getClientDetails').mockImplementation(async () => clientDetail);

    const resp = await policyService.getPolicyFile(poliza.policyNumber, iUserSSO);
    expect(resp.number).toBe(poliza.policyNumber);
  });

  it('searchPolicies OK', async () => {
    const policiesList: IPolicy[] = [];
    policiesList.push(poliza);
    const pagedResponse: IPagedResponse<IPolicy> = { code: 0, data: policiesList, message: '' };
    jest.spyOn(AdministrationRepo.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedResponse);

    const parametro = 'pdQKkfBD';
    const page = 1;
    const limit = 5;

    const resp = await policyService.searchPolicies(parametro, page, limit, iUserSSO);
    expect(resp.limit).toBe(limit);
  });

  it('getContractors OK (Company)', async () => {
    const pagedResponse: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };
    userData.clients[0].type = 1;
    jest.spyOn(AdministrationRepo.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByCompany').mockImplementation(async () => pagedResponse);

    const parametro = 'a';
    const page = 1;
    const limit = 5;

    const resp: IResponseDTO = await policyService.getContractors(page, limit, parametro, false, false, iUserSSO);
    console.log(resp);
    expect(resp.limit).toBe(limit);
    expect(resp.data.contractors).toHaveLength(1);
  });

  it('getContractors OK (Broker)', async () => {
    const pagedResponse: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };
    userData.clients[0].type = 0;
    jest.spyOn(AdministrationRepo.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedResponse);

    const parametro = 'a';
    const page = 1;
    const limit = 5;

    const resp = await policyService.getContractors(page, limit, parametro, false, false, iUserSSO);
    expect(resp.limit).toBe(limit);
    expect(resp.data.contractors).toHaveLength(1);
  });

  it('getContractors onlyBlocked OK', async () => {
    const polizaBlocked = clone(poliza);
    polizaBlocked.hasBlockedBenefits = true;
    const pagedResponse: IPagedResponse<IPolicy> = { code: 0, data: [polizaBlocked], message: '' };
    jest.spyOn(AdministrationRepo.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedResponse);

    const parametro = 'a';
    const page = 1;
    const limit = 5;

    const resp = await policyService.getContractors(page, limit, parametro, true, false, iUserSSO);
    expect(resp.limit).toBe(limit);
  });

  it('getContractors withRequirements OK', async () => {
    const polizaBlocked = clone(poliza);
    polizaBlocked.hasPendingRequirements = true;
    const pagedResponse: IPagedResponse<IPolicy> = { code: 0, data: [polizaBlocked], message: '' };
    jest.spyOn(AdministrationRepo.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedResponse);

    const parametro = 'a';
    const page = 1;
    const limit = 5;

    const resp = await policyService.getContractors(page, limit, parametro, false, true, iUserSSO);
    expect(resp.limit).toBe(limit);
  });

  it('getContractor OK', async () => {
    const pagedResponse: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };
    jest.spyOn(AdministrationRepo.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedResponse);
    jest.spyOn(CustomerApi.prototype, 'getClientDetails').mockImplementation(async () => clientDetail);

    const resp = await policyService.getContractor('96505760-9', iUserSSO);
    expect(resp.name).toBe('COLBUN  S.A  .');
  });

  it('searchHealthPolicies OK', async () => {
    const pagedResponse: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };
    jest.spyOn(AdministrationRepo.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedResponse);

    const resp = await policyService.searchHealthPolicies(iUserSSO);
    expect(resp.data.length).toBe(0);
  });

  it('validateContractorInsuredRut OK', async () => {
    const polizaResult = clone(poliza);
    polizaResult.hasHealthBenefits = true;
    const insuredcloned = clone(insured);
    const today = moment();
    insuredcloned.endDate = moment(today).add(1, 'days').toDate();
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [polizaResult, polizaResult], message: '' };
    const pagedPolicy2: IPagedResponse<IPolicy> = { code: 0, data: [poliza], message: '' };
    const companyRut = '96505760-9';
    const insuredRut = '19834039-8';
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByInsured').mockImplementation(async () => pagedPolicy);
    jest.spyOn(AdministrationRepo.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy2);
    jest.spyOn(PolicyApi.prototype, 'getPolicyDetail').mockImplementation(async () => poliza);
    jest.spyOn(PolicyApi.prototype, 'getInsuredDetail').mockImplementation(async () => insuredcloned);

    const resp = await policyService.validateContractorInsuredRut(insuredRut, companyRut, iUserSSO);
    expect(resp.code).toBe(0);
  });

  it('getInsuredList all policy OK', async () => {
    const insuredRut = '19.834.039-1';
    const policyNumber = 281221;

    jest.spyOn(PolicyApi.prototype, 'getInsuredDetail').mockImplementation(async () => insured);

    const resp = await policyService.getInsuredList(insuredRut, policyNumber, 1, 5, iUserSSO);
    expect(resp.code).toBe(0);
  });

  it('getInsuredList undefined insuredRut OK', async () => {
    const pagedInsured: IPagedResponse<IInsured> = { code: 0, data: [insured, insured], message: '' };
    const insuredRut = undefined;
    const policyNumber = 281221;

    jest.spyOn(PolicyApi.prototype, 'getInsuredsByPolicy').mockImplementation(async () => pagedInsured);

    const resp = await policyService.getInsuredList(insuredRut, policyNumber, 1, 5, iUserSSO);
    expect(resp.code).toBe(0);
  });
});
