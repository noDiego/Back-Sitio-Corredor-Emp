import { iUserSSO, mockCircuitResponse, resetMocks, startGlobals } from '../../helpers/globalMocks';
import { Container } from 'typedi';
import SubscriptionsApi from '../../../src/infrastructure/clients/subscriptionsApi';
import { IInsuranceReqInput, IInsuranceRequirement } from '../../../src/domain/interfaces/dto/v3/IInsuranceRequirement';
import { InsuranceReqResponse } from '../../../src/infrastructure/clients/dto/insuranceRequirement';
import { IPagedResponse } from '../../../src/domain/interfaces/dto/v1/IResponse';
import {
  InsuredVirtualSubscription,
  VirtualSubscriptionResponse
} from '../../../src/infrastructure/clients/dto/insured';

describe('SubscriptionsApi', () => {
  let subscriptionsApi: SubscriptionsApi;

  beforeAll(async () => {
    await startGlobals();
    jest.mock('axios');
    subscriptionsApi = Container.get(SubscriptionsApi);
  });

  afterAll(() => {
    resetMocks();
  });

  it('subscriptionsApi be defined', () => {
    expect(subscriptionsApi).toBeDefined();
  });

  it('getInsuranceRequirements OK', async () => {
    const insuranceResponse: InsuranceReqResponse = {
      insuranceRequirement: [
        {
          idRequirement: 123,
          policy: {
            renewalId: 123,
            policyNumber: 12345
          },
          insurance: {
            id: 1,
            rut: 12345678,
            dv: '9',
            name: 'insuranceName',
            capital: 0
          },
          requirementDate: new Date('2021-02-09T12:48:33.294Z'),
          requirementType: 'string',
          tokenNote: 'string',
          requirement: [
            {
              type: 'string',
              name: 'string',
              status: 'string',
              receptionDate: new Date('2021-02-09T12:48:33.294Z'),
              observacion: 'string'
            }
          ]
        }
      ],
      pagination: {
        quotaMax: 1
      }
    };

    const input: IInsuranceReqInput = {
      insuredRut: 12345678,
      policyNum: 12345,
      rutBroker: 11111111,
      rutCo: 22222222,
      rutInsurCo: 99301000
    };

    mockCircuitResponse(insuranceResponse, 200);

    const resp: IPagedResponse<IInsuranceRequirement> = await subscriptionsApi.getInsuranceRequirements(
      input,
      1,
      1,
      iUserSSO
    );
    expect(resp.code).toBe(0);
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].insured.name).toBe('insuranceName');
    expect(resp.data[0].idRequirement).toBe(123);
  });

  it('getInsuranceRequirements NODATA', async () => {
    const input: IInsuranceReqInput = {
      insuredRut: 12345678,
      policyNum: 12345,
      rutBroker: 11111111,
      rutCo: 22222222,
      rutInsurCo: 99301000
    };

    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const resp: IPagedResponse<IInsuranceRequirement> = await subscriptionsApi.getInsuranceRequirements(
      input,
      1,
      1,
      iUserSSO
    );
    console.log(resp);
    expect(resp.data).toHaveLength(0);
    expect(resp.code).toBe(1);
  });

  it('virtualSubscription OK', async () => {
    const insuranceResponse: VirtualSubscriptionResponse = {
      subscriptionCode: 0,
      underWritings: [
        {
          status: 200,
          message: 'test',
          underwritingCode: 1
        }
      ]
    };

    const input: InsuredVirtualSubscription[] = [
      {
        capital: 0,
        contractDate: new Date(),
        dv: '0',
        email: 'mail@mail.com',
        insuredGroup: 'group',
        policyNumber: 255255,
        rent: 1000,
        rut: 8990893,
        startValidityDate: new Date()
      }
    ];

    mockCircuitResponse(insuranceResponse, 200);

    const resp: VirtualSubscriptionResponse = await subscriptionsApi.virtualSubscription(input, iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.underWritings).toHaveLength(1);
    expect(resp.subscriptionCode).toBe(0);
  });

  it('virtualSubscription NODATA', async () => {
    const insuranceResponse: VirtualSubscriptionResponse = {
      subscriptionCode: 0,
      underWritings: [
        {
          status: 200,
          message: 'test',
          underwritingCode: 1
        }
      ]
    };

    const input: InsuredVirtualSubscription[] = [];

    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const resp: any = await subscriptionsApi.virtualSubscription(input, iUserSSO);

    expect(resp.code).toBe(1);
    expect(resp.data).toHaveLength(0);
  });
});
