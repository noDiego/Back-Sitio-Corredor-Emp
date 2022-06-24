import { iUserSSO, mockCircuitResponse, resetMocks, startGlobals } from '../../helpers/globalMocks';
import { Container } from 'typedi';
import CustomerApi from '../../../src/infrastructure/clients/customerApi';
import { IClient } from '../../../src/domain/interfaces/dto/v3/IClient';
import { ClientDetailResponse } from '../../../src/infrastructure/clients/dto/client';
import { ADDRESS_TYPE } from '../../../src/constants/types';

describe('CustomerApi', () => {
  let customerApi: CustomerApi;

  beforeAll(async () => {
    await startGlobals();
    customerApi = Container.get(CustomerApi);
  });

  afterAll(() => {
    resetMocks();
  });

  it('CustomerApi be defined', () => {
    expect(customerApi).toBeDefined();
  });

  it('getClientDetails OK', async () => {
    const clientDetailResponse: ClientDetailResponse = {
      client: {
        code: 1,
        rut: '16813306',
        dv: '5',
        socialName: 'socialName',
        activity: 'activity',
        businessActivity: 'businessActivity',
        address: [
          {
            type: ADDRESS_TYPE.MATRIZ,
            adress: 'addressMalEscrito',
            city: 'addressCity',
            phoneNumber: 'addressPhoneNumber'
          }
        ],
        contacts: [
          {
            name: 'contactName',
            email: 'contactEmail',
            phoneNumber: 'contactPhoneNumber'
          }
        ]
      }
    };

    mockCircuitResponse(clientDetailResponse, 200);

    const resp: IClient = await customerApi.getClientDetails(12123123, iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.rut).toBe('16813306-5');
    expect(resp.socialName).toBe('socialName');
  });

  it('getClientDetails NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const resp: IClient = await customerApi.getClientDetails(12123123, iUserSSO);

    expect(resp).toBe(null);
  });
});
