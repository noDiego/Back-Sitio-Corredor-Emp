import { iUserSSO, mockCircuitResponse, resetMocks, startGlobals } from '../../helpers/globalMocks';
import { Container } from 'typedi';
import ClaimsApi from '../../../src/infrastructure/clients/claimsApi';
import { IPrescription } from '../../../src/domain/interfaces/dto/v3/IPrescription';
import { PrescriptionResponse } from '../../../src/infrastructure/clients/dto/prescriptions';
import { InsuredDeductibleResponse } from '../../../src/infrastructure/clients/dto/insured';
import { InsuredDeductible } from '../../../src/domain/interfaces/dto/v3/IInsured';
import { Claim, ClaimsReponse } from '../../../src/infrastructure/clients/dto/claims';
import { IPagedResponse } from '../../../src/domain/interfaces/dto/v1/IResponse';
import {
  IDenounce,
  IDenounceDetail,
  IDenounceFileRouteDTO,
  IDenounceServiceInput
} from '../../../src/domain/interfaces/dto/v3/IDenounce';
import { ClaimsDetailResponse } from '../../../src/infrastructure/clients/dto/claimsDetails';
import { IPaymentTypeDetail } from '../../../src/domain/interfaces/dto/v3/IPaymentDetail';
import { PaymentTypeResponse } from '../../../src/infrastructure/clients/dto/paymentType';
import { HealthBeneficiaryResponse } from '../../../src/infrastructure/clients/dto/healthBeneficiaries';
import { HealthBeneficiary } from '../../../src/domain/interfaces/dto/v3/IHealthBeneficiary';
import { BackupDocumentsResponse } from '../../../src/infrastructure/clients/dto/documents';

const claimTest: Claim = {
  remittanceId: 'BATCHCIMED551834059-743204484',
  requestNumber: 743204484,
  requestStatus: 'APROBADA',
  claimsStatus: 'APROBADA',
  companyRut: 99301000,
  broker: {
    rut: 78734410,
    dv: '0',
    name: 'MERCER CORREDORES DE SEGUROS LTDA'
  },
  contractor: {
    rut: 96625550,
    dv: '1',
    name: 'ANDOVER ALIANZA MEDICA S.A'
  },
  policy: {
    renewalIdtrassa: 47556,
    policyNumber: 281732
  },
  plan: {
    code: 1,
    name: 'SALUD/DENTAL',
    claimType: {
      code: null,
      name: null
    }
  },
  startValidityDate: new Date('2019-08-01T00:00:00'),
  endValidityDate: new Date('2020-07-31T00:00:00'),
  issueDate: new Date('2020-02-06T00:00:00'),
  settlementDate: new Date('2020-02-06T00:00:00'),
  paymentDate: new Date('2020-02-06T00:00:00'),
  insured: {
    rut: 7207860,
    dv: '8',
    name: 'GUILLERMO PABLO GONZALEZ SILVA'
  },
  beneficiary: {
    correlative: 0,
    rut: 7207860,
    dv: '8',
    name: 'GUILLERMO PABLO GONZALEZ SILVA',
    relacion: 'TITULAR'
  },
  claimUser: null,
  claimChannel: 'IMED',
  claimedAmount: 522,
  paidAmount: 0,
  comments: null,
  pagination: {
    quotaMax: 154
  }
};

const input: IDenounceServiceInput = {
  brokerRut: 123456,
  companyRut: 123456,
  endDate: new Date(),
  insuredRut: 123456,
  limit: 11,
  page: 1,
  policyNumber: 123456,
  rutInsuranceCo: 123456,
  startDate: new Date(),
  status: "status",
  userRut: "123456-1"
};

describe('ClaimsApi', () => {
  let claimsApi: ClaimsApi;

  beforeAll(async () => {
    await startGlobals();
    claimsApi = Container.get(ClaimsApi);
  });

  afterAll(() => {
    resetMocks();
  });

  it('claimsApi be defined', () => {
    expect(claimsApi).toBeDefined();
  });

  it('getPrescriptions OK', async () => {
    const prescriptionResponse: PrescriptionResponse = {
      prescriptions: [
        {
          beneficiary: {
            correlative: 1,
            rut: 16813306,
            dv: '5',
            name: 'Diego',
            relacion: 'S'
          },
          requestNumber: 555,
          issueDate: new Date(),
          comments: 'comments test',
          endValidityDate: new Date(),
          name: 'Presc Name'
        }
      ]
    };

    mockCircuitResponse(prescriptionResponse, 200);

    const prescriptions: IPrescription[] = await claimsApi.getPrescriptions(12123123, 12123123, iUserSSO);

    expect(prescriptions).toBeDefined();
    expect(prescriptions).toHaveLength(1);
    expect(prescriptions[0].name).toBe(prescriptionResponse.prescriptions[0].name);
  });

  it('getPrescriptions NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const prescriptions: IPrescription[] = await claimsApi.getPrescriptions(12123123, 12123123, iUserSSO);

    expect(prescriptions).toHaveLength(0);
  });

  it('getInsuredDeductible OK', async () => {
    const insuredDeductibleResponse: InsuredDeductibleResponse = {
      deductibles: [
        {
          beneficiary: {
            correlative: 1,
            rut: 16813306,
            dv: '5',
            name: 'nameTest',
            relacion: 'relationTest'
          },
          rutTitular: 168133306,
          accumulatedSalud: 1000,
          accumulatedSaludDental: 2000
        }
      ]
    };

    mockCircuitResponse(insuredDeductibleResponse, 200);

    const deductibles: InsuredDeductible[] = await claimsApi.getInsuredDeductible(12123123, 12123123, iUserSSO);

    expect(deductibles).toBeDefined();
    expect(deductibles).toHaveLength(1);
    expect(deductibles[0].beneficiaryRut).toBe('16813306-5');
  });

  it('getInsuredDeductible NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const deductibles: InsuredDeductible[] = await claimsApi.getInsuredDeductible(12123123, 12123123, iUserSSO);

    expect(deductibles).toBe(null);
  });

  it('getDenouncesByCompanyAndInsured OK', async () => {
    const insuredDeductibleResponse: ClaimsReponse = { claims: [claimTest, claimTest] };

    mockCircuitResponse(insuredDeductibleResponse, 200);

    const denounces: IPagedResponse<IDenounce> = await claimsApi.getDenouncesByCompanyAndInsured(
        input,
      iUserSSO
    );

    expect(denounces.data).toHaveLength(2);
    expect(denounces.data[0].amountClaim).toBe(claimTest.claimedAmount);
  });

  it('getDenouncesByCompanyAndInsured NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const denounces: IPagedResponse<IDenounce> = await claimsApi.getDenouncesByCompanyAndInsured(
        input,
      iUserSSO
    );

    expect(denounces).toBe(null);
  });

  it('getDenouncesByBrokerAndInsured OK', async () => {
    const insuredDeductibleResponse: ClaimsReponse = { claims: [claimTest, claimTest] };

    mockCircuitResponse(insuredDeductibleResponse, 200);

    const denounces: IPagedResponse<IDenounce> = await claimsApi.getDenouncesByBrokerAndInsured(
        input,
      iUserSSO
    );

    expect(denounces.data).toHaveLength(2);
    expect(denounces.data[0].amountClaim).toBe(claimTest.claimedAmount);
  });

  it('getDenouncesByBrokerAndInsured NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const denounces: IPagedResponse<IDenounce> = await claimsApi.getDenouncesByBrokerAndInsured(
        input,
      iUserSSO
    );

    expect(denounces).toBe(null);
  });

  it('getDenouncesByPolicy OK', async () => {
    const insuredDeductibleResponse: ClaimsReponse = { claims: [claimTest, claimTest] };

    mockCircuitResponse(insuredDeductibleResponse, 200);

    const denounces: IPagedResponse<IDenounce> = await claimsApi.getDenouncesByPolicy(
        input,
      iUserSSO
    );

    expect(denounces.data).toHaveLength(2);
    expect(denounces.data[0].amountClaim).toBe(claimTest.claimedAmount);
  });

  it('getDenouncesByPolicy NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const denounces: IPagedResponse<IDenounce> = await claimsApi.getDenouncesByPolicy(
        input,
      iUserSSO
    );

    expect(denounces).toBe(null);
  });

  it('getDenouncesByRemittanceId OK', async () => {
    const insuredDeductibleResponse: ClaimsReponse = { claims: [claimTest, claimTest] };

    mockCircuitResponse(insuredDeductibleResponse, 200);

    const denounces: IPagedResponse<IDenounce> = await claimsApi.getDenouncesByRemittanceId(
      12123123,
      '12123123',
      1,
      1,
      iUserSSO
    );

    expect(denounces.data).toHaveLength(2);
    expect(denounces.data[0].amountClaim).toBe(claimTest.claimedAmount);
  });

  it('getDenouncesByRemittanceId NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const denounces: IPagedResponse<IDenounce> = await claimsApi.getDenouncesByRemittanceId(
      12123123,
      '12123123',
      1,
      1,
      iUserSSO
    );

    expect(denounces).toBe(null);
  });

  it('getClaimDetail OK', async () => {
    const claimsDetailResponse: ClaimsDetailResponse = {
      claimsDetail: [
        {
          claims: {
            remittanceId: 'string',
            requestNumber: 0,
            requestStatus: 'string',
            claimsStatus: 'string',
            companyRut: 0,
            broker: {
              rut: 0,
              dv: 'string',
              name: 'string'
            },
            contractor: {
              rut: 0,
              dv: 'string',
              name: 'string'
            },
            policy: {
              renewalIdtrassa: 0,
              policyNumber: 0
            },
            plan: {
              code: 0,
              name: 'string',
              claimType: {
                code: 'string',
                name: 'string'
              }
            },
            startValidityDate: new Date('2021-02-11T04:15:56.433Z'),
            endValidityDate: new Date('2021-02-11T04:15:56.433Z'),
            issueDate: new Date('2021-02-11T04:15:56.433Z'),
            settlementDate: new Date('2021-02-11T04:15:56.433Z'),
            paymentDate: new Date('2021-02-11T04:15:56.433Z'),
            insured: {
              rut: 0,
              dv: 'string',
              name: 'string'
            },
            beneficiary: {
              correlative: 0,
              rut: 0,
              dv: 'string',
              name: 'string',
              relacion: 'string'
            },
            claimUser: 'string',
            claimChannel: 'string',
            claimedAmount: 0,
            paidAmount: 0,
            comments: 'string',
            pagination: {
              quotaMax: 0
            }
          },
          paymentType: {
            uf: 0,
            type: 'string',
            bankName: 'string',
            bankAccount: '123account',
            costCenter: 'string'
          },
          benefits: [
            {
              name: 'string',
              claimDate: new Date('2021-02-11T04:15:56.433Z'),
              totalExpenses: 0,
              isapreContribution: 0,
              changesAmount: 0,
              bmiAmount: 0,
              coveragePercentage: 0,
              base: 0,
              deductible: 0,
              refund: 0,
              code: 0
            }
          ],
          deductiblesDetails: [
            {
              concept: 'string',
              individualAccRefund: 'string',
              familyAccRefund: 'string',
              individalPrevDeductible: 'string',
              familyPrevDeductible: 'string',
              individualAccDeductible: 'string',
              familyAccDeductible: 'string',
              individualAnnualDeductible: 'string',
              familyAnnualDeductible: 'string',
              annualLimit: 'string'
            }
          ]
        }
      ]
    };

    mockCircuitResponse(claimsDetailResponse, 200);

    const denounces: IDenounceDetail = await claimsApi.getClaimDetail(12123123, 16813306, iUserSSO);

    expect(denounces).toBeDefined();
    expect(denounces.paymentType.bankAccount).toBe('123account');
  });

  it('getClaimDetail NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const denounces: IDenounceDetail = await claimsApi.getClaimDetail(12123123, 16813306, iUserSSO);

    expect(denounces).toBe(null);
  });

  it('getPaymentDetails OK', async () => {
    const paymentTypeResponse: PaymentTypeResponse = {
      paymentTypeDetails: [
        {
          codigo: 1,
          destinatario: 'destinatarioString',
          cuenta: 'cuenta000',
          bank: {
            code: 2,
            name: 'bankName'
          },
          bankTypeAccount: {
            code: 3,
            name: 'bankType'
          }
        }
      ]
    };

    mockCircuitResponse(paymentTypeResponse, 200);

    const payments: IPaymentTypeDetail[] = await claimsApi.getPaymentDetails(12123123, iUserSSO);

    expect(payments).toBeDefined();
    expect(payments).toHaveLength(1);
    expect(payments[0].destinatario).toBe(paymentTypeResponse.paymentTypeDetails[0].destinatario);
    expect(payments[0].codigo).toBe(paymentTypeResponse.paymentTypeDetails[0].codigo);
  });

  it('getPaymentDetails NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const payments: IPaymentTypeDetail[] = await claimsApi.getPaymentDetails(12123123, iUserSSO);

    expect(payments).toBe(null);
  });

  it('getHealthBeneficiaries OK', async () => {
    const healthBeneficiaryResponse: HealthBeneficiaryResponse = {
      healthBeneficiaries: [
        {
          policy: {
            renewalIdtrassa: 47556,
            policyNumber: 281732
          },
          planBeneficiaries: {
            code: 1,
            name: 'SALUD/DENTAL',
            claimTypes: [
              {
                code: '1',
                name: 'AMBULATORIO'
              },
              {
                code: '2',
                name: 'DENTAL'
              },
              {
                code: '3',
                name: 'HOSPITALARIO'
              }
            ]
          },
          beneficiary: {
            correlative: 0,
            rut: 7207860,
            dv: '8',
            name: 'GONZALEZ  SILVA  GUILLERMO PABLO',
            relacion: 'TITULAR'
          }
        },
        {
          policy: {
            renewalIdtrassa: 47556,
            policyNumber: 281732
          },
          planBeneficiaries: {
            code: 3,
            name: 'CATASTROFICO',
            claimTypes: [
              {
                code: '1',
                name: 'AMBULATORIO'
              },
              {
                code: '3',
                name: 'HOSPITALARIO'
              }
            ]
          },
          beneficiary: {
            correlative: 0,
            rut: 7207860,
            dv: '8',
            name: 'GONZALEZ  SILVA  GUILLERMO PABLO',
            relacion: 'TITULAR'
          }
        }
      ]
    };

    mockCircuitResponse(healthBeneficiaryResponse, 200);

    const healthBeneficiaries: HealthBeneficiary[] = await claimsApi.getHealthBeneficiaries(
      16813306,
      7207860,
      99301000,
      99301000,
      99301000,
      'type',
      iUserSSO
    );

    expect(healthBeneficiaries).toBeDefined();
    expect(healthBeneficiaries).toHaveLength(2);
    expect(healthBeneficiaries[0].planBeneficiaries.code).toBe(healthBeneficiaries[0].planBeneficiaries.code);
  });

  it('getHealthBeneficiaries NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const healthBeneficiaries: HealthBeneficiary[] = await claimsApi.getHealthBeneficiaries(
      16813306,
      7207860,
      99301000,
      99301000,
      99301000,
      'type',
      iUserSSO
    );

    expect(healthBeneficiaries).toBe(null);
  });

  it('getBackupDocs OK', async () => {
    const backupDocumentsResponse: BackupDocumentsResponse = {
      Documentos: [
        {
          IdDocumento: 1,
          Url: 'http://google.cl'
        },
        {
          IdDocumento: 2,
          Url: 'http://altavista.cl'
        }
      ],
      httpCode: 200,
      httpMessage: 'OK',
      moreInformation: 'Info'
    };

    mockCircuitResponse(backupDocumentsResponse, 200);

    const denounceFileRoutes: IDenounceFileRouteDTO[] = await claimsApi.getBackupDocs(16813306, iUserSSO);

    expect(denounceFileRoutes).toBeDefined();
    expect(denounceFileRoutes).toHaveLength(2);
    expect(denounceFileRoutes[0].route).toBe(backupDocumentsResponse.Documentos[0].Url);
  });

  it('getBackupDocs NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const denounceFileRoutes: IDenounceFileRouteDTO[] = await claimsApi.getBackupDocs(16813306, iUserSSO);

    expect(denounceFileRoutes).toBe(null);
  });
});
