import express from 'express';
import request from 'supertest';
import { IToken } from '../../../src/domain/interfaces/dto/v3/IToken';
import SsoService from '../../../src/application/services/ssoService';
import { startGlobals } from '../../helpers/globalMocks';

const app = express();
const prefix = '/v1';

const iTokenObj: IToken = {
  accessToken: '12345',
  expiresIn: 1,
  refreshExpiresIn: 1,
  refreshToken: 'string',
  tokenType: 'string',
  idToken: 'string',
  notBeforePolicy: 1,
  sessionState: 'string'
};

describe('Autorizacion Route', () => {
  beforeAll(async () => {
    await startGlobals(app);
    //Container.get(SsoService);
  });

  it('se debe obtener token renovado', async () => {
    jest.spyOn(SsoService.prototype, 'refreshToken').mockImplementation(async () => iTokenObj);

    const resp = await request(app)
      .post(prefix + '/refresh')
      .send({ refreshToken: '123refresh' });
    expect(resp.body.accessToken).toBe('12345');
  }, 30000);

  it('se debe obtener accesstoken', async () => {
    jest.spyOn(SsoService.prototype, 'obtieneToken').mockImplementation(async () => iTokenObj);

    const resp = await request(app)
      .post(prefix + '/auth')
      .set('Auth-Code', '12345')
      .send({ redirectUri: 'redirectUri' });
    expect(resp.body.tokenData.accessToken).toBe('12345');
  }, 30000);

  it('se obtiene error por no recibir token', async () => {
    const sinToken = { ...iTokenObj };
    sinToken.accessToken = undefined;

    jest.spyOn(SsoService.prototype, 'obtieneToken').mockImplementation(async () => sinToken);

    const resp = await request(app)
      .post(prefix + '/auth')
      .set('Auth-Code', '12345')
      .send({ redirectUri: 'redirectUri' });
    expect(resp.status).toBe(401);
    expect(resp.body.message).toBe('No se pudo autenticar usuario');
  }, 30000);

  it('se obtiene error 500', async () => {
    jest.spyOn(SsoService.prototype, 'obtieneToken').mockImplementation(() => {
      throw new Error();
    });

    const resp = await request(app)
      .post(prefix + '/auth')
      .set('Auth-Code', '12345')
      .send({ redirectUri: 'redirectUri' });
    expect(resp.status).toBe(500);
  });
});
