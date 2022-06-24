import express from 'express';
import request from 'supertest';
import SsoService from '../../../src/application/services/ssoService';
import PolicyService from '../../../src/application/services/policyService';
import { IPolicyV1 } from '../../../src/domain/interfaces/dto/v1/IPolicy';
import moment from 'moment';
import { resetMocks, startGlobals } from '../../helpers/globalMocks';
import { IContractor } from '../../../src/domain/interfaces/dto/v3/IContractor';

const app = express();

const contractor1: IContractor = {
  name: 'BUSSENIUS Y TRINCADO LIMITADA',
  rut: '78.150.860-8',
  address: 'Huérfanos 1273, Santiago',
  bussinessLine: 'Asesoria'
};

const ficha: IPolicyV1 = {
  number: 281683,
  contractor: contractor1,
  status: 'CADUCADA',
  startDate: moment('2012-06-01').toDate(),
  endDate: moment('2013-05-31').toDate(),
  firstTerm: moment('2010-11-01').toDate(),
  renovation: 2,
  incumbentQuantity: 10,
  dependentQuantity: 25,
  subsidiaries: []
};

describe('Protected Route', () => {
  beforeAll(async () => {
    jest.spyOn(PolicyService.prototype, 'getPolicyFile').mockImplementationOnce(async () => ficha);
    jest.spyOn(PolicyService.prototype, 'validatePolicePermission').mockImplementationOnce(async () => {
      return;
    });
    await startGlobals(app, true);
  });

  beforeEach(() => {});

  afterAll(() => {
    resetMocks();
  });
  /*
  it('Se debe aprobar paso a ruta protegida', async () => {
    const resp = await request(app)
      .get('/v1/policy/file?id=168133065')
      .set('Auth-Token', '12345')
      .send({ redirectUri: 'redirectUri' });
    expect(resp.status).toBe(200);
  }, 30000);
*/
  it('Se debe denegar paso a ruta protegida al no usa token', async () => {
    const resp = await request(app).get('/v1/policy/file?id=168133065').send({ redirectUri: 'redirectUri' });
    expect(resp.status).toBe(401);
  }, 30000);

  it('Se debe denegar paso a ruta protegida si se usa un token invalido', async () => {
    jest.spyOn(SsoService.prototype, 'obtieneUser').mockImplementationOnce(() => {
      throw new Error('Token Invalido');
    });

    const resp = await request(app)
      .get('/v1/policy/file?id=168133065')
      .set('Auth-Token', '54321invalido')
      .send({ redirectUri: 'redirectUri' });
    expect(resp.status).toBe(401);
  }, 30000);
});
