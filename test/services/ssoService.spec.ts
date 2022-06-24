import { Container } from 'typedi';
import SsoService from '../../src/application/services/ssoService';
import logger from '../../src/loaders/logger';
import { IUserSSO } from '../../src/domain/interfaces/dto/v3/IUserSSO';
import { IToken } from '../../src/domain/interfaces/dto/v3/IToken';
import SsoClient from '../../src/infrastructure/clients/ssoClient';
import { resetMocks } from '../helpers/globalMocks';

const clientUserResponse: IUserSSO = {
  sub: 'subEjemplo',
  name: 'Juan Perez',
  preferredUsername: 'jperez',
  givenName: 'Juan',
  familyName: 'Perez',
  email: 'juanperez@mail.com'
};

const clientTokenResponse: IToken = {
  accessToken: '123456789abc',
  expiresIn: 300,
  refreshExpiresIn: 1800,
  refreshToken: '4321trewqdsa',
  tokenType: 'bearer',
  idToken:
    'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJVUEg4bVQ1RnJGdWpiQlNDcHB4dnpoRTRmTnZxa28xY0s3cFFhcmJZOUZZIn0',
  notBeforePolicy: 0,
  sessionState: 'b75bef6c-e2ea-4842-9d27-d9681a0a9b56'
};

describe('ssoService', () => {
  Container.set('logger', logger);
  const ssoService: SsoService = Container.get(SsoService);
  afterAll(() => {
    resetMocks();
  });

  it('SsoService be defined', () => {
    expect(ssoService).toBeDefined();
  });

  it('obtieneUser OK', async () => {
    const token = '123456789abc';

    jest.spyOn(SsoClient.prototype, 'obtieneUser').mockImplementation(async () => clientUserResponse);

    await expect(ssoService.obtieneUser(token)).resolves.toEqual(clientUserResponse);
  });

  it('obtieneToken OK', async () => {
    const authcode = 'pdQKkfBDAUwWnhfWQR9dGspgRmUPzPBy7l9GJkTogak.c819f50e-4722-43c5-80e0-c22dd9ea04fd';
    const redirectUri = 'http://localhost:4200/index.html';

    jest.spyOn(SsoClient.prototype, 'obtieneToken').mockImplementation(async () => clientTokenResponse);

    //Respuesta OK
    await expect(ssoService.obtieneToken(authcode, redirectUri)).resolves.toEqual(clientTokenResponse);
  });

  it('refreshToken OK', async () => {
    const refreshToken = 'pdQKkfBDAUwWnhfWQR9dGspgRmUPzPBy7l9GJkTogak.c819f50e-4722-43c5-80e0-c22dd9ea04fd';

    jest.spyOn(SsoClient.prototype, 'refreshToken').mockImplementation(async () => clientTokenResponse);

    //Respuesta OK
    await expect(ssoService.refreshToken(refreshToken)).resolves.toEqual(clientTokenResponse);
  });
});
