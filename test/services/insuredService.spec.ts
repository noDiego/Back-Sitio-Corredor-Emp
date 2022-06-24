import { Container } from 'typedi';
import InsuredService from '../../src/application/services/insuredService';
import logger from '../../src/loaders/logger';
import { IInsuredPolicyV1 } from '../../src/domain/interfaces/dto/v1/IInsuredPolicy';
import AdministrationRepo from '../../src/infrastructure/database/administrationRepository';
import { InsuredDeductibleDTO } from '../../src/domain/interfaces/dto/v1/IInsured';
import { IInsuranceRequirement } from '../../src/domain/interfaces/dto/v3/IInsuranceRequirement';
import { PAYROLL_TYPE_OPTIONS } from '../../src/constants/types';
import { IPrescription } from '../../src/domain/interfaces/dto/v3/IPrescription';
import { iUserSSO, resetMocks, startGlobals } from '../helpers/globalMocks';
import SubscriptionsApi from '../../src/infrastructure/clients/subscriptionsApi';
import { IPagedResponse } from '../../src/domain/interfaces/dto/v1/IResponse';
import PolicyApi from '../../src/infrastructure/clients/policyApi';
import { IInsured, InsuredEdition } from '../../src/domain/interfaces/dto/v3/IInsured';
import { IUserDTO } from '../../src/domain/interfaces/dto/administration/IUserDTO';
import { IPolicy } from '../../src/domain/interfaces/dto/v3/IPolicy';
import ClaimsApi from '../../src/infrastructure/clients/claimsApi';
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

const listaAsegurados: IInsuredPolicyV1[] = [];

listaAsegurados.push({
  policyNumber: 281684,
  rutSubsidiary: '59.083.900-0',
  subsidiary: 'TELEFONICA INGENIERIA DE SEGURIDAD S A AGENCIA DE CHILE',
  codeGroup: 350025,
  group: 'PLAN EMPLEADOS (S-D)',
  rut: '16.813.306-5',
  name: 'PABLO FIGUEIRAS TORRES'
});

listaAsegurados.push({
  policyNumber: 289576,
  rutSubsidiary: '96.547.010-7',
  subsidiary: 'INMOBILIARIA PASEO DE LA ESTACION S.A',
  codeGroup: 360621,
  group: 'PLAN ESPECIAL SR. GERARDO LEYTON LABBE RUT:5.228.909-2',
  rut: '18.174.501-0',
  name: 'JUAN SOBARZO MORALES'
});

listaAsegurados.push({
  policyNumber: 297689,
  rutSubsidiary: '78.781.620-7',
  subsidiary: 'TRANSPORTADORA MARANDINO LIMITADA',
  codeGroup: 386778,
  group: 'PLAN EMPLEADOS MAYORES DE 65 HASTA 70 AÑOS (V+MA+ITP 2/3+DESM.)CATODOS RADOMIRO TOMIC',
  rut: '8.990.893-0',
  name: 'PEDRO GONZALES PEREZ'
});

listaAsegurados.push({
  policyNumber: 297689,
  rutSubsidiary: '78.781.620-7',
  subsidiary: 'TRANSPORTADORA MARANDINO LIMITADA',
  codeGroup: 386746,
  group: 'PLAN EMPLEADOS MAYORES DE 65 HASTA 70 AÑOS (V+MA+ITP 2/3+DESM.)PROYECTO IMA',
  rut: '12.165.324-9',
  name: 'ANA ZAVALA ZAVALA'
});

listaAsegurados.push({
  policyNumber: 281684,
  rutSubsidiary: '81.826.800-9',
  subsidiary: 'CAJA DE COMPENSACION DE ASIGNACION FAMILIAR DE LOS ANDES',
  codeGroup: 315813,
  group: 'UMAR-VALPO/ROL GENERAL (SIN CONV. ISAPRE)',
  rut: '9.168.286-9',
  name: 'LUISA AMALIA CHAVARRIA MELLA'
});

listaAsegurados.push({
  policyNumber: 289576,
  rutSubsidiary: '81.826.800-9',
  subsidiary: 'CAJA DE COMPENSACION DE ASIGNACION FAMILIAR DE LOS ANDES',
  codeGroup: 315821,
  group: 'UMAR-VALPO/ROL PRIVADO (SIN CONV. ISAPRE)',
  rut: '5.649.139-2',
  name: 'PROSPERINA DE LAS MERCEDES QUIROZ VALENZUELA'
});

const insuredEdit: InsuredEdition = {
  allPolicies: 'true',
  policyNumber: '123',
  rut: '16.813.306-5',
  birthday: new Date('2019-08-01T04:00:00.000Z'),
  maritalStatus: 'Soltero',
  accountNumber: '183174501',
  address: 'Avenida Siempre Viva 742',
  email: 'ceciliasobarzo78@vida.com',
  cellphone: '56912345678'
};

const requirement1: IInsuranceRequirement = {
  requirements: undefined,
  idRequirement: 100,
  insured: {
    id: 1,
    rut: '25674896-8',
    name: 'Juan Perez',
    capital: 50,
    subsidiary: {
      name: 'Nombre Filial ' + 25674896
    }
  },
  policy: undefined,
  requestDate: new Date('2019-08-01T04:00:00.000Z'),
  requestType: PAYROLL_TYPE_OPTIONS.CHANGE_AFFILIATE,
  token: 'token'
};

describe('policyService', () => {
  let insuredService: InsuredService;

  beforeAll(async () => {
    Container.set('logger', logger);
    await startGlobals(null, true);
    insuredService = Container.get(InsuredService);
  });
  afterAll(() => {
    resetMocks();
  });

  it('PolicyService be defined', async () => {
    expect(insuredService).toBeDefined();
  });

  it('getInsuredFile OK', async () => {
    const insuredRut = '9420772-K';
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };

    jest.spyOn(AdministrationRepo.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy);
    jest.spyOn(PolicyApi.prototype, 'getInsuredDetail').mockImplementation(async () => insured);
    jest.spyOn(PolicyApi.prototype, 'getInsuredCoverageByPolicy').mockImplementation(async () => null);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByInsured').mockImplementation(async () => pagedPolicy);

    const resp = await insuredService.getInsuredFile(insuredRut, '281221', iUserSSO);
    expect(resp.data.rut).toBe(insuredRut);
  });

  it('searchInsured OK', async () => {
    const parametro = '9420772-K';
    const page = 1;
    const limit = 5;
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };

    jest.spyOn(PolicyApi.prototype, 'getPoliciesByInsured').mockImplementation(async () => pagedPolicy);
    jest.spyOn(AdministrationRepo.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByBroker').mockImplementation(async () => pagedPolicy);
    jest.spyOn(PolicyApi.prototype, 'getInsuredDetail').mockImplementation(async () => insured);

    const resp = await insuredService.searchInsured(parametro, page, limit, iUserSSO);
    expect(resp.limit).toBe(limit);
  });

  it('update all policies OK', async () => {
    const pagedPolicy: IPagedResponse<IPolicy> = { code: 0, data: [poliza, poliza], message: '' };

    jest.spyOn(PolicyApi.prototype, 'getPoliciesByInsured').mockImplementation(async () => pagedPolicy);
    jest.spyOn(PolicyApi.prototype, 'updateInfoAsegurado').mockImplementation(async () => true);

    const resp = await insuredService.updateInfo(insuredEdit, iUserSSO);
    expect(resp.code).toBe(0);
  });

  it('update one policy OK', async () => {
    const updateInfo = clone(insuredEdit);
    updateInfo.allPolicies = 'false';

    jest.spyOn(PolicyApi.prototype, 'updateInfoAsegurado').mockImplementation(async () => true);

    const resp = await insuredService.updateInfo(updateInfo, iUserSSO);
    expect(resp.code).toBe(0);
  });

  it('update con errores de validacion', async () => {
    const insuredEditError: InsuredEdition = {
      allPolicies: 'true',
      policyNumber: '123',
      rut: '16.813.306-5',
      birthday: new Date('2019-08-01T04:00:00.000Z'),
      maritalStatus: 'Soltero',
      address: 'Avenida Siempre Viva 742'
    };
    insuredEditError.cellphone = '1231258912';
    insuredEditError.email = 'algosinarroba.cl';
    insuredEditError.accountNumber = '181742350163453523';

    const resp = await insuredService.updateInfo(insuredEditError, iUserSSO);

    expect(resp.code).toBe(99);
  });

  it('Genera XLS Nomina', async () => {
    const pagedResponse: IPagedResponse<IInsured> = {
      code: 0,
      data: [],
      limit: 0,
      message: 'OK',
      page: 1,
      recordTotal: 0,
      totalPage: 1
    };
    jest.spyOn(PolicyApi.prototype, 'getInsuredsByPolicy').mockImplementation(async () => pagedResponse);
    const resp = await insuredService.generateXLSNomina(282165, iUserSSO);
    expect(resp).toBeDefined();
  });

  it('getInsuredDeductible OK', async () => {
    const deductibleInsured: InsuredDeductibleDTO[] = [];
    deductibleInsured.push({
      beneficiaryName: 'JOSE ALBERTO BADILLA SOBARZO',
      beneficiaryRut: '19834039-8',
      dentalAmount: 3,
      healthAmount: 0
    });
    deductibleInsured.push({
      beneficiaryName: 'MARIA LUCILA MORALES SEPULVEDA',
      beneficiaryRut: '3781561-6',
      dentalAmount: 2,
      healthAmount: 1
    });
    jest.spyOn(ClaimsApi.prototype, 'getInsuredDeductible').mockImplementation(async () => deductibleInsured);
    const resp = await insuredService.getInsuredDeductible('70016330-K', '', '97547', iUserSSO);
    expect(resp.code).toBe(0);
  });

  it('getInsurabilityRequirement OK', async () => {
    const iPagedResponse: IPagedResponse<IInsuranceRequirement> = {
      code: 0,
      data: [requirement1],
      message: ''
    };
    jest.spyOn(SubscriptionsApi.prototype, 'getInsuranceRequirements').mockImplementation(async () => iPagedResponse);
    const resp = await insuredService.getInsurabilityRequirement('70016330-K', 281091, iUserSSO);
    expect(resp.code).toBe(0);
  });

  it('getPrescriptions OK', async () => {
    const insuredRut = '9420772-K';
    const prescriptionDummy3: IPrescription = {
      beneficiary: {
        dv: '1',
        name: 'FRANCISCO JAVIER-ALTIMIRAS GONZALEZ',
        rut: 16419646,
        correlative: null,
        relacion: 'HIJO'
      },
      comment: 'Comentario de prueba. FRANCISCO JAVIER',
      endDate: new Date('2019-08-01T04:00:00.000Z'),
      issueDate: new Date('2019-08-01T04:00:00.000Z'),
      requestNumber: 12,
      status: 'VIGENTE',
      name: ''
    };
    jest.spyOn(ClaimsApi.prototype, 'getPrescriptions').mockImplementation(async () => [prescriptionDummy3]);
    const resp = await insuredService.getPrescriptions(insuredRut, 281221, 1, 5, iUserSSO);
    expect(resp.code).toBe(0);
  });

  it('getInsurabilityRequirements OK', async () => {
    const contractorRut = '96505760-9';
    const iPagedResponse: IPagedResponse<IInsuranceRequirement> = {
      code: 0,
      data: [requirement1],
      message: ''
    };

    jest.spyOn(SubscriptionsApi.prototype, 'getInsuranceRequirements').mockImplementation(async () => iPagedResponse);

    const resp = await insuredService.getInsurabilityRequirements(contractorRut, 1, 5, '', iUserSSO);
    expect(resp.code).toBe(0);
  });
});
