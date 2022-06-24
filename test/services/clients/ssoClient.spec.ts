import { resetMocks, startGlobals } from '../../helpers/globalMocks';
import mockAxios from '../../__mocks__/axios';
import { Container } from 'typedi';
import SsoClient from '../../../src/infrastructure/clients/ssoClient';
import { IUserSSO } from '../../../src/domain/interfaces/dto/v3/IUserSSO';
import { URLS } from '../../../src/constants/urls';
import qs from 'qs';
import { IToken } from '../../../src/domain/interfaces/dto/v3/IToken';

const ssoUserResponse = {
  sub: 'subEjemplo',
  name: 'Juan Perez',
  preferred_username: 'jperez',
  given_name: 'Juan',
  family_name: 'Perez',
  email: 'juanperez@mail.com'
};

const clientUserResponse: IUserSSO = {
  sub: 'subEjemplo',
  name: 'Juan Perez',
  preferredUsername: 'jperez',
  givenName: 'Juan',
  familyName: 'Perez',
  email: 'juanperez@mail.com'
};

const ssoTokenResponse = {
  access_token: '123456789abc',
  expires_in: 300,
  refresh_expires_in: 1800,
  refresh_token: '4321trewqdsa',
  token_type: 'bearer',
  id_token:
    'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJVUEg4bVQ1RnJGdWpiQlNDcHB4dnpoRTRmTnZxa28xY0s3cFFhcmJZOUZZIn0',
  'not-before-policy': 0,
  session_state: 'b75bef6c-e2ea-4842-9d27-d9681a0a9b56'
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

describe('ssoClient', () => {
  let ssoClient: SsoClient;

  beforeAll(async () => {
    await startGlobals();
    jest.mock('axios');
    ssoClient = Container.get(SsoClient);
  });

  afterAll(() => {
    resetMocks();
  });

  it('ssoCliente be defined', () => {
    expect(ssoClient).toBeDefined();
  });
  /*
  it('obtieneUser OK', async () => {
    const responseOk = { status: 200, data: ssoUserResponse };
    mockAxios.post.mockImplementationOnce(() => Promise.resolve(responseOk));

    const token = '123456789abc';

    const data = qs.stringify({ access_token: token });
    const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

    //Respuesta OK
    await expect(ssoClient.obtieneUser(token)).resolves.toEqual(clientUserResponse);

    //Datos de llamada ok
    expect(mockAxios.post).toHaveBeenCalledWith(URLS.userInfo, data, config);
  });
*/
  it('obtieneUser ERROR 401', async () => {
    const stringError = 'Error de prueba';
    const responseError = {
      status: 401,
      statusText: 'Unauthorized',
      response: { data: { error_description: stringError } }
    };

    mockAxios.post.mockImplementationOnce(() => Promise.reject(responseError));

    //Respuesta con error
    await expect(ssoClient.obtieneUser('123 error')).rejects.toThrow(Error('Unauthorized'));
  });

  it('obtieneUser ERROR 500', async () => {
    const stringError = 'Error de prueba';
    const responseError = {
      status: 500,
      statusText: 'Internal Server Error',
      response: { data: { error_description: stringError } }
    };

    mockAxios.post.mockImplementationOnce(() => Promise.reject(responseError));

    //Respuesta con error
    await expect(ssoClient.obtieneUser('123 error')).rejects.toThrow(Error(stringError));
  });

  it('obtieneToken OK', async () => {
    const responseOk = { status: 200, data: ssoTokenResponse };
    mockAxios.post.mockImplementationOnce(() => Promise.resolve(responseOk));

    const authcode = 'pdQKkfBDAUwWnhfWQR9dGspgRmUPzPBy7l9GJkTogak.c819f50e-4722-43c5-80e0-c22dd9ea04fd';
    const redirectUri = 'http://localhost:4200/index.html';

    const data = qs.stringify({
      grant_type: 'authorization_code',
      client_id: 'vs-site-brokers',
      redirect_uri: redirectUri,
      code: authcode
    });
    const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

    //Respuesta OK
    await expect(ssoClient.obtieneToken(authcode, redirectUri)).resolves.toEqual(clientTokenResponse);

    //Datos de llamada ok
    expect(mockAxios.post).toHaveBeenCalledWith(URLS.token, data, config);
  });

  it('refreshToken OK', async () => {
    const responseOk = { status: 200, data: ssoTokenResponse };
    mockAxios.post.mockImplementationOnce(() => Promise.resolve(responseOk));

    const refreshtoken = 'pdQKkfBDAUwWnhfWQR9dGspgRmUPzPBy7l9GJkTogak.c819f50e-4722-43c5-80e0-c22dd9ea04fd';

    const data = qs.stringify({
      grant_type: 'refresh_token',
      client_id: 'vs-site-brokers',
      refresh_token: refreshtoken
    });
    const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

    //Respuesta OK
    await expect(ssoClient.refreshToken(refreshtoken)).resolves.toEqual(clientTokenResponse);

    //Datos de llamada ok
    expect(mockAxios.post).toHaveBeenCalledWith(URLS.token, data, config);
  });

  it('obtieneToken ERROR 400 Code not valid', async () => {
    const authcode = 'pdQKkfBDAUwWnhfWQR9dGspgRmUPzPBy7l9GJkTogak.c819f50e-4722-43c5-80e0-c22dd9ea04fd';
    const redirectUri = 'http://localhost:4200/index.html';

    const responseError = {
      status: 400,
      statusText: 'Bad Request',
      response: { data: { error: 'invalid_grant', error_description: 'Code not valid' } }
    };

    mockAxios.post.mockImplementationOnce(() => Promise.reject(responseError));

    //Respuesta con error
    await expect(ssoClient.obtieneToken(authcode, redirectUri)).rejects.toThrow(Error('Code not valid'));
  });

  it('obtieneToken ERROR 500', async () => {
    const authcode = 'pdQKkfBDAUwWnhfWQR9dGspgRmUPzPBy7l9GJkTogak.c819f50e-4722-43c5-80e0-c22dd9ea04fd';
    const redirectUri = 'http://localhost:4200/index.html';
    const responseError = {
      status: 500,
      statusText: 'Internal Server Error',
      response: { data: { error_description: '' } }
    };

    mockAxios.post.mockImplementationOnce(() => Promise.reject(responseError));

    //Respuesta con error
    await expect(ssoClient.obtieneToken(authcode, redirectUri)).rejects.toThrow(Error(''));
  });
});
