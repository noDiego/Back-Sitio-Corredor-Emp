import { resetMocks, startGlobals } from '../../helpers/globalMocks';
import { CircuitBreaker } from '../../../src/utils/circuitBreaker/circuitBreaker';
import breakerInstance from '../../../src/utils/circuitBreaker/breakerInstance';
import { AxiosRequestConfig } from 'axios';
import AppInsights = require('applicationinsights');
import { CorrelationContext } from 'applicationinsights/out/AutoCollection/CorrelationContextManager';

jest.mock('axios', () => jest.fn(() => Promise.resolve({ data: 'TestOK' })));

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeAll(async () => {
    await startGlobals();
  });

  afterAll(() => {
    resetMocks();
  });

  it('CircuitBreaker be defined', () => {
    circuitBreaker = breakerInstance('Test');
    expect(circuitBreaker).toBeDefined();
  });

  it('CircuitBreaker Axios OK', async () => {
    const corr: CorrelationContext = { customProperties: undefined, operation: { id: '1', name: '', parentId: '' } };

    circuitBreaker = breakerInstance('Test');
    jest.spyOn(AppInsights, 'getCorrelationContext').mockImplementationOnce(() => corr);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: 'https://www.google.com',
      headers: undefined,
      params: undefined
    };

    const resp = await circuitBreaker.exec(axiosRequest);
    expect(resp.data).toBeDefined();
    expect(resp.data).toBe('TestOK');
  });
});
