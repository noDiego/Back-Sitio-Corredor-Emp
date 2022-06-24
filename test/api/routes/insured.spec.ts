import express from 'express';
import request from 'supertest';
import { startGlobals } from '../../helpers/globalMocks';
import InsuredService from '../../../src/application/services/insuredService';
import moment from 'moment';
import { IInsuredDTO } from '../../../src/domain/interfaces/dto/v1/IInsured';
import { IResponseDTO } from '../../../src/utils/interfaces/IResponse';
import { InsuredEdition } from '../../../src/domain/interfaces/dto/v3/IInsured';

const app = express();
const prefix = '/v1/insured';

const insured: IInsuredDTO = {
  rut: '1-9',
  firstName: 'CECILIA DE LAS NIEVES SOBARZO MORALES',
  lastName: 'SOBARZO MORALES',
  birthday: moment('1978-05-22').toDate(),
  maritalStatus: 'Soltero',
  bankName: 'BANCO ESTADO DE CHILE',
  bankAccountType: 'CUENTA CORRIENTE',
  bankAccountNumber: '18174501',
  address: 'Avenida Siempre Viva 742',
  commune: 'Providencia',
  city: 'Santiago',
  region: 'Region Metropolitana',
  email: 'ceciliasobarzo78@vida.com',
  phone: '(+56)986542346',
  cellphone: '(+56)986542346',
  isapre: 'Banmedica',
  policy: undefined,
  plans: [],
  beneficiaries: []
};

const insuredEdit: InsuredEdition = {
  allPolicies: 'true',
  policyNumber: '123',
  rut: '16.813.306-5',
  birthday: new Date('2019-08-01T04:00:00.000Z'),
  maritalStatus: 'Soltero',
  accountNumber: '1817423501',
  address: 'Avenida Siempre Viva 742',
  email: 'ceciliasobarzo78@vida.com',
  cellphone: '56986542346'
};

const iresponsedto: IResponseDTO = {
  code: 0,
  message: 'OK',
  data: [],
  page: 1,
  limit: 1,
  totalPage: 1,
  recordTotal: 10
};

const iresponseinsureddto: IResponseDTO = {
  code: 0,
  message: 'OK',
  data: insured
};

describe('Poliza Route', () => {
  beforeAll(async () => {
    await startGlobals(app, true);
  });

  it('dummyTest', async () => {
    expect(1).toBe(1);
  });

  it('se debe obtener ficha de poliza', async () => {
    jest.spyOn(InsuredService.prototype, 'getInsuredFile').mockImplementationOnce(async () => iresponseinsureddto);

    const resp = await request(app)
      .get(prefix + '/file?rut=168133065&policy=123456')
      .set('Auth-Token', '12345')
      .send({ redirectUri: 'redirectUri' });
    expect(resp.status).toBe(200);
    expect(resp.body.data.rut).toBe('1-9');
  });

  it('se debe obtener error en ficha de poliza', async () => {
    const getInsuredFileSpy = jest.spyOn(InsuredService.prototype, 'getInsuredFile');
    getInsuredFileSpy.mockImplementationOnce(async () => {
      throw new Error('Error');
    });

    const resp = await request(app)
      .get(prefix + '/file?rut=168133065&policy=123456')
      .set('Auth-Token', '12345')
      .send({ redirectUri: 'redirectUri' });
    expect(resp.status).toBe(500);
    expect(getInsuredFileSpy).toHaveBeenCalled();
  });

  it('se debe obtener resultado de busqueda de poliza', async () => {
    jest.spyOn(InsuredService.prototype, 'searchInsured').mockImplementationOnce(async () => iresponsedto);
    const resp = await request(app)
      .get(prefix + '/search?data=nombre&page=1&limit=2')
      .set('Auth-Token', '12345')
      .send({ redirectUri: 'redirectUri' });
    expect(resp.status).toBe(200);
    expect(resp.body.recordTotal).toBe(10);
  });

  it('se debe obtener error en resultado de busqueda de poliza', async () => {
    jest.spyOn(InsuredService.prototype, 'searchInsured').mockImplementationOnce(async () => {
      throw new Error('Error en busqueda');
    });
    const resp = await request(app)
      .get(prefix + '/search?data=nombre&page=1&limit=2')
      .set('Auth-Token', '12345')
      .send({ redirectUri: 'redirectUri' });
    expect(resp.status).toBe(500);
  });

  it('se debe llamar a servicio de actualizacion de asegurado', async () => {
    jest.spyOn(InsuredService.prototype, 'updateInfo').mockImplementationOnce(async () => iresponsedto);
    const resp = await request(app)
      .put(prefix + '/profile')
      .set('Auth-Token', '12345')
      .send(insuredEdit);
    expect(resp.status).toBe(200);
    expect(resp.body.recordTotal).toBe(10);
  });

  it('se debe obtener error a servicio de actualizacion de asegurado', async () => {
    jest.spyOn(InsuredService.prototype, 'updateInfo').mockImplementationOnce(async () => iresponsedto);
    const resp = await request(app)
      .put(prefix + '/profile')
      .set('Auth-Token', '12345')
      .send(insuredEdit);
    expect(resp.status).toBe(200);
    expect(resp.body.recordTotal).toBe(10);
  });
});
