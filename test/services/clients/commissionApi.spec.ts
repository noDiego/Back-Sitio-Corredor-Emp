import { iUserSSO, mockCircuitResponse, resetMocks, startGlobals } from '../../helpers/globalMocks';
import { Container } from 'typedi';
import CommissionApi from '../../../src/infrastructure/clients/commissionApi';
import {
  CommissionPeriodsRes,
  Intermediary,
  IntermediaryRes
} from '../../../src/infrastructure/clients/dto/commission';
import { ICommissionPeriodsRes } from "../../../src/domain/interfaces/dto/v3/ICommission";
import { HttpError } from "../../../src/infrastructure/clients/dto/httpErrorMayus";
import { clone } from "../../../src/utils/utils";

const periodsRes: CommissionPeriodsRes = {
      "periods": [
        {
          "code": "201901",
          "value": "201901"
        },
        {
          "code": "201902",
          "value": "201902"
        }
      ]
    }
;

const httpError: HttpError = {httpCode: 500, httpMessage: 'NOK', moreInformation: 'NOK'};


describe('CommissionApi', () => {
  let commissionApi: CommissionApi;

  beforeAll(async () => {
    await startGlobals();
    commissionApi = Container.get(CommissionApi);
  });

  afterAll(() => {
    resetMocks();
  });

  it('CommissionApi be defined', () => {
    expect(commissionApi).toBeDefined();
  });

  it('getIntermediaryCode OK', async () => {
    const interCodes: Intermediary[] = [
      {
        code: '00007777',
        name: 'Intermediary Name One',
        type: '1'
      }
    ]

    const IntermediaryResponse: IntermediaryRes = {
      intermediaries: interCodes
    }

    mockCircuitResponse(IntermediaryResponse, 200);

    const resp: Intermediary[] = await commissionApi.getIntermediaryCode('78734410', iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.length).toBe(1);
  });

  it('getCommissionPeriods OK', async () => {
    mockCircuitResponse(periodsRes, 200);

    const resp: ICommissionPeriodsRes = await commissionApi.getCommissionPeriods('78734410', iUserSSO);

    expect(resp).toBeDefined();
    expect(resp.periods).toHaveLength(2);
  });

  it('getCommissionPeriods ERROR', async () => {
    mockCircuitResponse(httpError, 500);

    try {
      await commissionApi.getCommissionPeriods('78734410', iUserSSO);
    } catch (e) {
      console.log(e);
      expect(e.code).toBe(1);
      expect(e.serviceName).toBe('CommissionPeriods');
      expect(e.status).toBe(500);
    }
  });

  it('getCommissionPeriods SIN DATOS', async () => {
    const errorSinDatos: HttpError = clone(httpError);
    errorSinDatos.httpCode = 404;
    errorSinDatos.httpMessage = 'SIN DATOS';
    mockCircuitResponse(errorSinDatos, 404);

    const resp: ICommissionPeriodsRes = await commissionApi.getCommissionPeriods('78734410', iUserSSO);
    expect(resp).toBeNull();

  });

});
