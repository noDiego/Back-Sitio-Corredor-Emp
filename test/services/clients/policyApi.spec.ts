import PolicyApi from '../../../src/infrastructure/clients/policyApi';
import { iUserSSO, mockCircuitResponse, resetMocks, startGlobals } from '../../helpers/globalMocks';
import { Container } from 'typedi';
import { IPolicy } from '../../../src/domain/interfaces/dto/v3/IPolicy';
import { PolicyDetail, PolicyShort } from '../../../src/infrastructure/clients/dto/policy';
import { PoliciesResponse } from '../../../src/infrastructure/clients/dto/policiesResponse';
import { IPagedResponse } from '../../../src/domain/interfaces/dto/v1/IResponse';
import { IPlan } from '../../../src/domain/interfaces/dto/v3/IPlan';
import { Plan } from '../../../src/infrastructure/clients/dto/plan';
import { ContactInfoUpdate, InsuredDetail, InsuredShort } from '../../../src/infrastructure/clients/dto/insured';
import { IInsured } from '../../../src/domain/interfaces/dto/v3/IInsured';
import { InsuredsResponse } from '../../../src/infrastructure/clients/dto/insuredsResponse';
import { PolicyCoverage } from '../../../src/infrastructure/clients/dto/product';
import { HttpErrorMayus, HttpError } from '../../../src/infrastructure/clients/dto/httpErrorMayus';
import { ReportResponse } from '../../../src/infrastructure/clients/dto/report';
import Utils from '../../../src/utils/utils';
import { IServiceResponse } from '../../../src/domain/interfaces/dto/v3/IServiceResponse';
import { IInsuredGroupChangeInput } from "../../../src/domain/interfaces/dto/v3/IInsuredGroup";
import { ISubsidiaryChangeInput } from "../../../src/domain/interfaces/dto/v3/ISubsidiary";

const policyShort: PolicyShort = {
  renewalId: 11068608,
  policyNumber: 281732,
  insuranceCoRut: 99301000,
  insuranceCoDv: '6',
  tradeGroup: {
    number: 281732,
    name: 'ANDOVER ALIANZA MEDCA S.A.'
  },
  contractor: {
    rut: 96625550,
    dv: '1',
    name: 'ANDOVER ALIANZA MEDICA S.A.'
  },
  company: {
    rut: 96625550,
    dv: '1',
    name: 'ANDOVER ALIANZA MEDICA S.A.',
    businessActivity: 'DISTRIBUIDORA-COMERCIO'
  },
  broker: {
    rut: 78734410,
    dv: '0',
    name: 'DE SEGUROS LTDA. MERCER CORREDORES'
  },
  status: 'VIGENTE',
  firstTerm: new Date('2011-08-01T00:00:00'),
  startDate: new Date('2011-08-01T00:00:00'),
  endDate: new Date('2011-08-01T00:00:00'),
  renewal: 8,
  productDescription: 'VIDA, SALUD',
  numberOfHolders: 40,
  numberOfBeneficiaries: 36,
  hasBlockedBenefits: 'NO',
  hasDebt: 'SI',
  hasHealthBenefits: 'SI',
  hasPendingRequirements: 'NO'
};
const insuredShort: InsuredShort = {
  renewalId: 11068608,
  policyNumber: 281732,
  code: 13217656,
  rut: 24123800,
  dv: '8',
  firstName: 'GERARDO SILVIO',
  lastName: 'FERRUCCI DI GIOVANNI',
  birthDate: new Date('1979-08-13T00:00:00'),
  activeDependents: '0',
  civilStatus: {
    code: 1,
    name: null
  },
  gender: {
    code: 'M',
    name: 'MASCULINO'
  },
  insuredGroup: {
    idGroup: 4,
    code: 62285,
    name: 'PLAN EMPLEADOS '
  },
  subsidiary: {
    code: 11027,
    rut: 96625550,
    dv: '1',
    name: 'ANDOVER ALIANZA MEDICA S.A.'
  },
  plan: {
    code: 250301,
    name: 'PLAN EMPLEADOS '
  },
  products: [
    {
      code: 2,
      name: 'SALUD',
      tokenDoc: null
    },
    {
      code: 1,
      name: 'VIDA',
      tokenDoc: null
    }
  ],
  originalStartDate: new Date('1979-08-13T00:00:00'),
  startDate: new Date('1979-08-13T00:00:00'),
  endDate: new Date('1979-08-13T00:00:00'),
  capital: 0,
  rent: 0
};

describe('PolicyApi', () => {
  let policyApi: PolicyApi;

  beforeAll(async () => {
    await startGlobals();
    policyApi = Container.get(PolicyApi);
  });

  afterAll(() => {
    resetMocks();
  });

  it('PolicyApi be defined', () => {
    expect(policyApi).toBeDefined();
  });

  it('PolicyDetail OK', async () => {
    const policyResponse: PolicyDetail = {
      renewalId: 11068608,
      policyNumber: 281732,
      insuranceCoRut: 99301000,
      insuranceCoDv: '6',
      tradeGroup: {
        number: 281732,
        name: 'ANDOVER ALIANZA MEDCA S.A.'
      },
      contractor: {
        rut: 96625550,
        dv: '1',
        name: 'ANDOVER ALIANZA MEDICA S.A.'
      },
      company: {
        rut: 96625550,
        dv: '1',
        name: 'ANDOVER ALIANZA MEDICA S.A.',
        businessActivity: 'DISTRIBUIDORA-COMERCIO'
      },
      broker: {
        rut: 78734410,
        dv: '0',
        name: 'DE SEGUROS LTDA. MERCER CORREDORES'
      },
      status: 'VIGENTE',
      firstTerm: new Date('2011-08-01T00:00:00'),
      startDate: new Date('2019-08-01T00:00:00'),
      endDate: new Date('2020-07-31T00:00:00'),
      renewal: 8,
      productDescription: 'VIDA, SALUD',
      numberOfHolders: 40,
      numberOfBeneficiaries: 36,
      products: [
        {
          code: 2,
          name: 'SALUD',
          tokenDoc: null
        },
        {
          code: 1,
          name: 'VIDA',
          tokenDoc: null
        }
      ],
      plans: [
        {
          code: 250301,
          name: 'PLAN EMPLEADOS',
          requiresCapital: 'NO',
          requiresRent: 'NO',
          products: null
        },
        {
          code: 250302,
          name: 'PLAN MAYORES DE 65 AÑOS HASTA 70 AÑOS',
          requiresCapital: 'NO',
          requiresRent: 'NO',
          products: null
        }
      ],
      subsidiaries: [
        {
          code: 11027,
          rut: 96625550,
          dv: '1',
          name: 'ANDOVER ALIANZA MEDICA S.A.'
        }
      ],
      insuredGroup: [
        {
          idGroup: 62285,
          code: 4,
          name: 'PLAN EMPLEADOS',
          startDate: new Date('2019-08-01T00:00:00'),
          endDate: new Date('2019-08-01T00:00:00'),
          planCode: 250301,
          subsidiaryCode: 11027,
          collectiongGroupCode: 55111
        },
        {
          idGroup: 369768,
          code: 5,
          name: 'PLAN MAYORES DE 65 AÑOS HASTA 70 AÑOS',
          startDate: new Date('2019-08-01T00:00:00'),
          endDate: new Date('2019-08-01T00:00:00'),
          planCode: 250302,
          subsidiaryCode: 11027,
          collectiongGroupCode: 55111
        }
      ],
      collectionGroup: [
        {
          idGroup: 1,
          code: 55111,
          rut: 96625550,
          dv: '1',
          name: 'COBRANZA ANDOVER ALIANZA MEDICA S.A.',
          benefitStatus: 'ACTIVO',
          debtStatus: 'DEUDA VENCIDA',
          currentDebtAmount: 0,
          expiredDebtAmount: 3896713
        }
      ],
      hasBlockedBenefits: 'NO',
      hasDebt: 'SI',
      hasHealthBenefits: 'SI',
      hasPendingRequirements: 'NO'
    };

    mockCircuitResponse(policyResponse, 200);

    const resp: IPolicy = await policyApi.getPolicyDetail(281732, iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.renewalId).toBe(11068608);
    expect(resp.hasDebt).toBe(true);
  });

  it('PolicyDetail NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const resp: IPolicy = await policyApi.getPolicyDetail(281732, iUserSSO);

    expect(resp).toBe(null);
  });

  it('getPoliciesByCompany OK', async () => {
    const policiesResponse: PoliciesResponse = {
      pagination: {
        quotaMax: 1
      },
      policies: [policyShort]
    };

    mockCircuitResponse(policiesResponse, 200);

    const resp: IPagedResponse<IPolicy> = await policyApi.getPoliciesByCompany(12345678, 12345678, 1, 1, iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.data).toBeDefined();
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].policyNumber).toBe(281732);
  });

  it('getPoliciesByCompany NODATA', async () => {
    const policiesResponse: PoliciesResponse = {
      pagination: {
        quotaMax: 1
      },
      policies: [policyShort]
    };

    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const resp: IPagedResponse<IPolicy> = await policyApi.getPoliciesByCompany(12345678, 12345678, 1, 1, iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.data).toBeDefined();
    expect(resp.data).toHaveLength(0);
    expect(resp.code).toBe(1);
  });

  it('getPoliciesByBroker OK', async () => {
    const policiesResponse: PoliciesResponse = {
      pagination: {
        quotaMax: 1
      },
      policies: [policyShort]
    };

    mockCircuitResponse(policiesResponse, 200);

    const resp: IPagedResponse<IPolicy> = await policyApi.getPoliciesByBroker(12345678, 12345678, 1, 1, iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.data).toBeDefined();
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].policyNumber).toBe(281732);
  });

  it('getPoliciesByBroker NODATA', async () => {
    const policiesResponse: PoliciesResponse = {
      pagination: {
        quotaMax: 1
      },
      policies: [policyShort]
    };

    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const resp: IPagedResponse<IPolicy> = await policyApi.getPoliciesByBroker(12345678, 12345678, 1, 1, iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.data).toBeDefined();
    expect(resp.data).toHaveLength(0);
    expect(resp.code).toBe(1);
  });

  it('getPoliciesByInsured OK', async () => {
    const policiesResponse: PoliciesResponse = {
      pagination: {
        quotaMax: 1
      },
      policies: [policyShort]
    };

    mockCircuitResponse(policiesResponse, 200);

    const resp: IPagedResponse<IPolicy> = await policyApi.getPoliciesByInsured(12345678, 12345678, 1, 1, iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.data).toBeDefined();
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].policyNumber).toBe(281732);
  });

  it('getPoliciesByInsured NODATA', async () => {
    const policiesResponse: PoliciesResponse = {
      pagination: {
        quotaMax: 1
      },
      policies: [policyShort]
    };

    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const resp: IPagedResponse<IPolicy> = await policyApi.getPoliciesByInsured(12345678, 12345678, 1, 1, iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.data).toBeDefined();
    expect(resp.data).toHaveLength(0);
    expect(resp.code).toBe(1);
  });

  it('getPlanDetail OK', async () => {
    const planDetailResponse: Plan = {
      code: 250301,
      name: 'PLAN EMPLEADOS ',
      requiresCapital: 'NO',
      requiresRent: 'NO',
      products: [
        {
          code: 2,
          name: 'SALUD',
          coverages: [
            {
              coverageId: '95',
              code: '0060',
              name: 'GASTOS SALUD',
              appliesBenefitPlan: 'SI',
              tokenBenefits: '1147629'
            },
            {
              coverageId: '96',
              code: '0061',
              name: 'CATASTRÓFICO ',
              appliesBenefitPlan: 'SI',
              tokenBenefits: '1147630'
            },
            {
              coverageId: '97',
              code: '0062',
              name: 'GASTOS DENTALES',
              appliesBenefitPlan: 'SI',
              tokenBenefits: '1147631'
            }
          ]
        },
        {
          code: 1,
          name: 'VIDA',
          coverages: [
            {
              coverageId: '73',
              code: '0040',
              name: 'TEMPORAL VIDA ',
              appliesBenefitPlan: 'NO',
              tokenBenefits: null
            },
            {
              coverageId: '74',
              code: '0041',
              name: 'MUERTE ACCIDENTAL',
              appliesBenefitPlan: 'NO',
              tokenBenefits: null
            },
            {
              coverageId: '83',
              code: '0050',
              name: 'INVALIDEZ 2/3% POR ENF. Y ACC',
              appliesBenefitPlan: 'NO',
              tokenBenefits: null
            }
          ]
        }
      ]
    };

    mockCircuitResponse(planDetailResponse, 200);

    const planDetail: IPlan = await policyApi.getPlanDetail(12345678, 12345678, iUserSSO);

    expect(planDetail).toBeDefined();
    expect(planDetail.code).toBe(250301);
    expect(planDetail.requiresCapital).toBeFalsy;
  });

  it('getPlanDetail NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const planDetail: IPlan = await policyApi.getPlanDetail(12345678, 12345678, iUserSSO);

    expect(planDetail).toBe(null);
  });

  it('getInsuredDetail OK', async () => {
    const insuredDetailResponse: InsuredDetail = {
      renewalId: 11068608,
      policyNumber: 281732,
      code: 13217656,
      rut: 24123800,
      dv: '8',
      firstName: 'GERARDO SILVIO',
      lastName: 'FERRUCCI DI GIOVANNI',
      birthDate: new Date('1979-08-13T00:00:00'),
      activeDependents: '0',
      civilStatus: {
        code: 1,
        name: null
      },
      gender: {
        code: 'M',
        name: 'MASCULINO'
      },
      insuredGroup: {
        idGroup: 4,
        code: 62285,
        name: 'PLAN EMPLEADOS ',
        startDate: new Date('1979-08-13T00:00:00'),
        endDate: new Date('1979-08-13T00:00:00'),
        planCode: 0,
        subsidiaryCode: 0,
        collectiongGroupCode: 0
      },
      subsidiary: {
        code: 11027,
        rut: 96625550,
        dv: '1',
        name: 'ANDOVER ALIANZA MEDICA S.A.'
      },
      plan: {
        code: 250301,
        name: 'PLAN EMPLEADOS '
      },
      originalStartDate: new Date('1979-08-13T00:00:00'),
      startDate: new Date('1979-08-13T00:00:00'),
      endDate: new Date('1979-08-13T00:00:00'),
      capital: 0,
      rent: 0,
      accountBank: {
        bank: {
          bankCode: 7,
          bankName: 'BANCO SANTANDER SANTIAGO'
        },
        accountType: {
          accountCode: 2,
          accountName: 'CUENTA VISTA'
        },
        accountNumber: '999999999'
      },
      contactInfo: {
        address: 'Direccion de prueba',
        commune: {
          communeCode: 209,
          communeName: null
        },
        city: {
          cityCode: 209,
          cityName: 'ALTO HOSPICIO'
        },
        region: {
          regionCode: 1,
          regionName: 'REGION DE TARAPACA'
        },
        emailAddress: 'manuel@test.cl',
        phoneNumber: null,
        cellPhone: '99876543'
      },
      isapre: {
        code: 'I14',
        name: 'SFERA'
      },
      familyGroup: {
        dependent: []
      },
      beneficiaryVersion: {
        version: [
          {
            versionNumber: 0,
            beneficiaries: []
          }
        ]
      }
    };

    mockCircuitResponse(insuredDetailResponse, 200);

    const insuredDetail: IInsured = await policyApi.getInsuredDetail(281732, 12345678, iUserSSO);

    expect(insuredDetail).toBeDefined();
    expect(insuredDetail.policyNumber).toBe(281732);
    expect(insuredDetail.code).toBe(13217656);
  });

  it('getInsuredDetail NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const insuredDetail: IInsured = await policyApi.getInsuredDetail(281732, 12345678, iUserSSO);

    expect(insuredDetail).toBe(null);
  });

  it('getInsuredsByPolicy OK', async () => {
    const insuredsResponse: InsuredsResponse = {
      insureds: [insuredShort],
      pagination: {
        quotaMax: 1
      }
    };

    mockCircuitResponse(insuredsResponse, 200);

    const insuredsResp: IPagedResponse<IInsured> = await policyApi.getInsuredsByPolicy(281732, 1, 1, iUserSSO);

    expect(insuredsResp).toBeDefined();
    expect(insuredsResp.data).toBeDefined();
    expect(insuredsResp.data).toHaveLength(1);
    expect(insuredsResp.data[0].code).toBe(13217656);
    expect(insuredsResp.data[0].products).toHaveLength(2);
  });

  it('getInsuredCoverageByPolicy OK', async () => {
    const policyCoverageResponse: PolicyCoverage = { code: 555, name: '555', products: [] };

    mockCircuitResponse(policyCoverageResponse, 200);

    const coverage: IPlan = await policyApi.getInsuredCoverageByPolicy(281732, 18133056, 1, iUserSSO);

    expect(coverage).toBeDefined();
    expect(coverage.code).toBe(555);
    expect(coverage.name).toBe('555');
  });

  it('getInsuredCoverageByPolicy NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const coverage: IPlan = await policyApi.getInsuredCoverageByPolicy(281732, 18133056, 1, iUserSSO);

    expect(coverage).toBe(null);
  });

  it('updateInfoAsegurado OK', async () => {
    const inputData: ContactInfoUpdate = {
      accountNumber: '123',
      address: 'Address 111',
      bankCode: 1,
      bankType: 2,
      cellPhone: '96268876',
      commune: 1,
      dv: '5',
      emailAddress: 'mail@gmail.com',
      isapre: 'ISAPRE',
      phoneNumber: '96268876',
      rut: 16813306,
      user: 'UserName'
    };

    const response: HttpErrorMayus = { HttpCode: 200, HttpMessage: 'OK', MoreInformation: 'OK' };
    jest.spyOn(PolicyApi.prototype, 'cleanInsuredDetailCache').mockImplementation(async () => true);
    mockCircuitResponse(response, 200);

    const result: boolean = await policyApi.updateInfoAsegurado(281732, inputData, iUserSSO);

    expect(result).toBeDefined();
    expect(result).toBeTruthy();
  });

  it('updateInfoAsegurado FAIL', async () => {
    const inputData: ContactInfoUpdate = {
      accountNumber: '123',
      address: 'Address 111',
      bankCode: 1,
      bankType: 2,
      cellPhone: '96268876',
      commune: 1,
      dv: '5',
      emailAddress: 'mail@gmail.com',
      isapre: 'ISAPRE',
      phoneNumber: '96268876',
      rut: 16813306,
      user: 'UserName'
    };

    const response: HttpErrorMayus = { HttpCode: 500, HttpMessage: 'OK', MoreInformation: 'OK' };

    mockCircuitResponse(response, 500);

    try {
      const result: boolean = await policyApi.updateInfoAsegurado(281732, inputData, iUserSSO);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.code).toBe(1);
      expect(e.status).toBe(500);
    }
  });

  it('getReport OK', async () => {
    const document64 = Utils.stringToBase64('stringTest');

    const response: ReportResponse = { base64: document64 };

    mockCircuitResponse(response, 200);
    let document: string = await policyApi.getReport(12123123, 281732, 1, iUserSSO);
    expect(document).toBeDefined();

    mockCircuitResponse(response, 200);
    document = await policyApi.getReport(12123123, 281732, 2, iUserSSO);
    expect(document).toBeDefined();

    mockCircuitResponse(response, 200);
    document = await policyApi.getReport(12123123, 281732, 3, iUserSSO);
    expect(document).toBeDefined();

    mockCircuitResponse(response, 200);
    document = await policyApi.getReport(12123123, 281732, 4, iUserSSO);

    expect(document).toBeDefined();
    expect(document).toBe(document64);
  });

  it('getReport NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );
    const document: string = await policyApi.getReport(12123123, 281732, 1, iUserSSO);

    expect(document).toBeDefined();
    expect(document).toBe(null);
  });

  it('exclusionInsured OK', async () => {
    const response: HttpError = { httpCode: 200, httpMessage: 'OK', moreInformation: 'OK' };

    mockCircuitResponse(response, 200);

    const result: IServiceResponse = await policyApi.exclusionInsured(281732, '1', 123456, new Date(), iUserSSO);

    expect(result).toBeDefined();
    expect(result.success).toBeTruthy();
  });

  it('exclusionInsured Fail', async () => {
    const statusCodeResp = 400;

    const response: HttpErrorMayus = { HttpCode: statusCodeResp, HttpMessage: 'NOK', MoreInformation: 'NOK' };

    mockCircuitResponse(response, statusCodeResp);

    try {
      await policyApi.exclusionInsured(281732, '1', 123456, new Date(), iUserSSO);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.code).toBe(1);
      expect(e.status).toBe(500);
    }
  });

  it('insuredGroupChange OK', async () => {
    const response: HttpError = { httpCode: 200, httpMessage: 'OK', moreInformation: 'OK' };

    mockCircuitResponse(response, 200);

    const input: IInsuredGroupChangeInput = {
      capital: 1,
      insuredDV: "1",
      insuredGroup: 123456,
      insuredRut: 12345678,
      policyNumber: 123456,
      rent: 100,
      startDate: new Date()
    };
    const result: IServiceResponse = await policyApi.insuredGroupChange(
      input,
      iUserSSO
    );

    expect(result).toBeDefined();
    expect(result.success).toBeTruthy();
  });

  it('insuredGroupChange Fail', async () => {
    const statusCodeResp = 400;

    const response: HttpErrorMayus = { HttpCode: statusCodeResp, HttpMessage: 'NOK', MoreInformation: 'NOK' };

    mockCircuitResponse(response, statusCodeResp);

    try {
      const input: IInsuredGroupChangeInput = {
        capital: 123456,
        insuredDV: "K",
        insuredGroup: 123456,
        insuredRut: 123456,
        policyNumber: 281732,
        rent: 123456,
        startDate: new Date(),
      };
      await policyApi.insuredGroupChange(input , iUserSSO);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.code).toBe(1);
      expect(e.status).toBe(500);
    }
  });

  it('insuredSubsidiaryChange OK', async () => {
    const response: HttpError = { httpCode: 200, httpMessage: 'OK', moreInformation: 'OK' };

    mockCircuitResponse(response, 200);
    const input: ISubsidiaryChangeInput = {
      capital: 1,
      insuredGroup: 1,
      insuredRut: 12345678,
      policyNumber: 123456,
      rent: 100,
      startDate: new Date(),
      subsidiary: 0
    };
    const result: IServiceResponse = await policyApi.insuredSubsidiaryChange(
      input,
      iUserSSO
    );

    expect(result).toBeDefined();
    expect(result.success).toBeTruthy();
  });

  it('insuredSubsidiaryChange Fail', async () => {
    const statusCodeResp = 400;

    const response: HttpErrorMayus = { HttpCode: statusCodeResp, HttpMessage: 'NOK', MoreInformation: 'NOK' };

    mockCircuitResponse(response, statusCodeResp);

    try {
      const input: ISubsidiaryChangeInput = {
        capital: 1,
        insuredGroup: 1,
        insuredRut: 12345678,
        policyNumber: 123456,
        rent: 100,
        startDate: new Date(),
        subsidiary: 0
      };
      await policyApi.insuredSubsidiaryChange(input, iUserSSO);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.code).toBe(1);
      expect(e.status).toBe(500);
    }
  });
});
