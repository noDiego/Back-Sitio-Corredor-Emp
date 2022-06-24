import NodeClient from '../__mocks__/NodeClient';
import RedisClient from '../__mocks__/RedisClient';
import { IUserSSO } from '../../src/domain/interfaces/dto/v3/IUserSSO';
import express, { Express } from 'express';
import * as insight from '../../src/loaders/insight';
import * as appInsights from 'applicationinsights';
import { Container } from 'typedi';
import SsoService from '../../src/application/services/ssoService';
import iconv from 'iconv-lite';
import expressLoader from '../../src/loaders/express';
import logger from '../../src/loaders/logger';
import AzureBusClient from '../../src/infrastructure/clients/azureBusClient';
import { CircuitBreaker } from '../../src/utils/circuitBreaker/circuitBreaker';
import typeorm = require('typeorm');

export const iUserSSO: IUserSSO = {
  tokenData: {
    accessToken: '12345',
    expiresIn: 300,
    idToken:
      'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJVUEg4bVQ1RnJGdWpiQlNDcHB4dnpoRTRmTnZxa28xY0s3cFFhcmJZOUZZIn0.eyJqdGkiOiI5NDkzODU2ZS02ZjJhLTQ0YzUtOWFhOS0wOGU3ODFlNzkxNzkiLCJleHAiOjE1OTg0NjQyNzUsIm5iZiI6MCwiaWF0IjoxNTk4NDYzOTc1LCJpc3MiOiJodHRwczovL2Rlcy1zc28uc2VjdXJpdHkuY2w6ODU0My9hdXRoL3JlYWxtcy9WUy1Ccm9rZXJzIiwiYXVkIjoidnMtc2l0ZS1icm9rZXJzIiwic3ViIjoiZGUwY2ZkNjYtYTk2NC00NDIyLTlhYTEtYjRmZjg3MjNlYzk4IiwidHlwIjoiSUQiLCJhenAiOiJ2cy1zaXRlLWJyb2tlcnMiLCJhdXRoX3RpbWUiOjE1OTg0NjM5MDMsInNlc3Npb25fc3RhdGUiOiI3YTJlODJmOC05Zjg2LTRlM2EtYmYwZC1mN2YwNjA4ZTk1NDQiLCJhY3IiOiIwIiwibmFtZSI6IjIgYnJhaW5zIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiMTExMTExMTEtMSIsImdpdmVuX25hbWUiOiIyIiwiZmFtaWx5X25hbWUiOiJicmFpbnMiLCJlbWFpbCI6IjExMTExMTExMUAyYnJhaW5zLmNsIn0.LNanVTIABbdTxrhxp0HDPCig-m9u9BIu1dn7XyjrsJi_kaf0VHUmYh8G9J_514Tbxjb64HQ6_hvgpI5LEad3GafADScNoiOKi09-aZvyoZLHGGuZ5o-aiXXAvev83NBEq8tZhZMqNYWwgv1UXAv5NOmDmCsGe9q02XI-D5FE3hCIlAQuoZKFkViQMv3jknKo1jwRpPVLL-lKpYwyP8-HfspbLF6J7H-6slIS8suiMQheE5q9n6BLltDTF-tieKGZq_j_r9Qfs9nVO5Ko-g3gMnbaMewPtxWjEe8uARcBP0amNiFj0dgtqupnEZbyr2sHoIZ8M5SDzcAWAvhqHQd7_A',
    notBeforePolicy: 0,
    refreshExpiresIn: 1800,
    refreshToken:
      'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJVUEg4bVQ1RnJGdWpiQlNDcHB4dnpoRTRmTnZxa28xY0s3cFFhcmJZOUZZIn0.eyJqdGkiOiI4ZWViNWU2Ni04MzA4LTQ1MzAtYTZjMC04MTBjNzM3M2EzYTYiLCJleHAiOjE1OTg0NjU3NzUsIm5iZiI6MCwiaWF0IjoxNTk4NDYzOTc1LCJpc3MiOiJodHRwczovL2Rlcy1zc28uc2VjdXJpdHkuY2w6ODU0My9hdXRoL3JlYWxtcy9WUy1Ccm9rZXJzIiwiYXVkIjoidnMtc2l0ZS1icm9rZXJzIiwic3ViIjoiZGUwY2ZkNjYtYTk2NC00NDIyLTlhYTEtYjRmZjg3MjNlYzk4IiwidHlwIjoiUmVmcmVzaCIsImF6cCI6InZzLXNpdGUtYnJva2VycyIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6IjdhMmU4MmY4LTlmODYtNGUzYS1iZjBkLWY3ZjA2MDhlOTU0NCIsImNsaWVudF9zZXNzaW9uIjoiMzQ5MzQ5MWItYTU2My00YTM2LWI2YjAtNzljNmJlMjNjZDJkIiwicmVzb3VyY2VfYWNjZXNzIjp7fX0.vNtvLOrtPpc7tqtsCIPn8eYKL3_Y8pyIAQdgCNtmNTPeMjQHT7avWYPWF6GMnXMfxWCqiOAFuL9ptdCxdjbqDrnjqzxcahr4GISGNkSjntnKQIFupuRESN1HomSkIGo22o1f1I-nwaqnditT_PF6vhoxva3larNvQXBBYp9cCxvxD-WO3ZxOg2O54H8rWr118eTMqYXwk1IWMCAmyO_cThPW1eTe-nvHQVPrFuEhSAFwLx0ex2aC59nX8Ifua-P-PNm9rEvUeBFJTFJsjBX-IJyty6n4bomXkx7lqbQhUcy2-HWuUaa0hahhnEJEXzNrDMciQ2_17ZbbTyxn3r8X-w',
    sessionState: '7a2e82f8-9f86-4e3a-bf0d-f7f0608e9544',
    tokenType: 'bearer'
  },
  email: 'email@correo.cl',
  familyName: 'Gonzalez',
  givenName: 'Juan',
  name: 'Juan',
  preferredUsername: 'Juan',
  sub: 'sub'
};

function initJestMocks() {
  jest.spyOn(insight, 'default').mockReturnValue(appInsights.defaultClient);
  jest.spyOn(SsoService.prototype, 'obtieneUser').mockImplementation(async () => iUserSSO);
}

export async function startGlobals(app?: Express, mockDBConnection = false): Promise<void> {
  jest.clearAllMocks();

  iconv.decode(Buffer.from([]), 'win1251'); // para forzar carga de encodings
  jest.useFakeTimers();
  initJestMocks(); // Mocks comunes para tests

  if (mockDBConnection) {
    typeorm.getManager = jest.fn().mockReturnValue({
      save: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findByIds: jest.fn().mockReturnThis()
    });
  }

  Container.set('logger', logger);
  await expressLoader(app ? app : express());
  Container.set('InsightClient', NodeClient); // Instancia para Insight
  if (!Container.has('AzureBusClient')) Container.set('AzureBusClient', new AzureBusClient()); // Instancia para AzureBusClient
  Container.set('RedisClient', RedisClient); // Instancia para RedisClient
}

export function resetMocks() {
  jest.restoreAllMocks();
  jest.resetModules();
  jest.clearAllMocks();
  Container.reset();
}

export function mockCircuitResponse(data: any, statusCode: number) {
  const response = {
    data: data,
    status: statusCode,
    statusText: 'string',
    headers: 'any',
    config: undefined,
    request: 'any'
  };

  if (statusCode >= 400)
    jest.spyOn(CircuitBreaker.prototype, 'exec').mockImplementationOnce(() => Promise.reject({ response: response }));
  else jest.spyOn(CircuitBreaker.prototype, 'exec').mockImplementationOnce(() => Promise.resolve(response));
}

function mockAxios() {
  let axiosMockedResp;
  jest.mock('axios', () => jest.fn(() => axiosMockedResp));
  // export function setAxiosMockResponse(response: Promise<any>): void {
  //   axiosMockedResp = response;
  // }
}
