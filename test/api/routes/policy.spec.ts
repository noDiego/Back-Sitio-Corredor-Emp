import express from 'express';
import request from 'supertest';
import { IPolicyV1 } from '../../../src/domain/interfaces/dto/v1/IPolicy';
import { IResponseDTO } from '../../../src/utils/interfaces/IResponse';
import moment from 'moment';
import { startGlobals } from '../../helpers/globalMocks';
import PolicyService from '../../../src/application/services/policyService';
import { IValueObjectV1 } from '../../../src/domain/interfaces/dto/v1/IValueObject';
import { IGroupV1 } from '../../../src/domain/interfaces/dto/v1/IGroup';
import { ISubsidiaryV1 } from '../../../src/domain/interfaces/dto/v1/ISubsidiary';
import { IContractor } from '../../../src/domain/interfaces/dto/v3/IContractor';

const app = express();
const prefix = '/v1/policy';

const collectionGemini2: IValueObjectV1 = {
  code: '72106',
  name: 'COBRANZA EMPRESA DE TRANSPORTES GEMINIS SPA'
};

const groupsGemini2: IGroupV1[] = [];
groupsGemini2.push({
  code: '386738',
  name: 'PLAN EMPLEADOS MENORES DE 65 AÑOS (V+MA+ITP 2/3+DESM.)PROYECTO SALFA',
  planName: 'PLAN EMPLEADOS MENORES DE 65 AÑOS (V+MA+ITP 2/3+DESM.)',
  startDate: moment('2020-03-01').toDate(),
  endDate: moment('2021-02-28').toDate(),
  collection: collectionGemini2
});
groupsGemini2.push({
  code: '386746',
  name: 'PLAN EMPLEADOS MAYORES DE 65 HASTA 70 AÑOS (V+MA+ITP 2/3+DESM.)PROYECTO IMA',
  planName: 'PLAN EMPLEADOS MAYORES DE 65 HASTA 70 AÑOS (V+MA+ITP 2/3+DESM.)',
  startDate: moment('2020-03-01').toDate(),
  endDate: moment('2021-02-28').toDate(),
  collection: collectionGemini2
});
const subsidiaries: ISubsidiaryV1[] = [];
subsidiaries.push({
  rut: '84756600-0',
  name: 'EMPRESA DE TRANSPORTES GEMINIS SPA ',
  startDate: moment('2020-03-01').toDate(),
  endDate: moment('2021-02-28').toDate(),
  groupQuantity: 2,
  collectionQuantity: 1,
  groups: groupsGemini2
});

const contractor: IContractor = {
  name: 'GEMINIS GROUP',
  rut: '76045121-5',
  address: 'Av. O’Higgins #078, Calama, Chile',
  bussinessLine: 'Servicios Varios'
};

const ficha: IPolicyV1 = {
  number: 281683,
  contractor: contractor,
  status: 'VIGENTE',
  startDate: moment('2020-03-01').toDate(),
  endDate: moment('2021-02-28').toDate(),
  firstTerm: moment('2019-03-01').toDate(),
  renovation: 2,
  incumbentQuantity: 500,
  dependentQuantity: 1234,
  subsidiaries: subsidiaries
};

const contractor1: IContractor = {
  name: 'BUSSENIUS Y TRINCADO LIMITADA',
  rut: '78.150.860-8',
  address: 'Huérfanos 1273, Santiago',
  bussinessLine: 'Asesorias'
};
const contractor2: IContractor = {
  name: 'BANCO CENTRAL DE CHILE',
  rut: '97.029.000-1',
  address: 'Agustinas 1180, Santiago Chile',
  bussinessLine: 'Servicios Financieros'
};

const listaPolizas: IPolicyV1[] = [
  {
    number: 281683,
    contractor: contractor1,
    status: 'CADUCADA',
    startDate: moment('2012-06-01').toDate(),
    endDate: moment('2013-05-31').toDate(),
    firstTerm: moment('2010-11-01').toDate(),
    renovation: 2,
    incumbentQuantity: 10,
    dependentQuantity: 25
  },
  {
    number: 283060,
    contractor: contractor2,
    status: 'VIGENTE',
    startDate: moment('2020-06-01').toDate(),
    endDate: moment('2021-05-31').toDate(),
    firstTerm: moment('2020-06-01').toDate(),
    renovation: 1,
    incumbentQuantity: 20,
    dependentQuantity: 60
  }
];

const response: IResponseDTO = {
  code: 0,
  message: 'OK',
  data: listaPolizas,
  page: 1,
  limit: 2,
  totalPage: 1,
  recordTotal: 2
};

describe('Poliza Route', () => {
  beforeAll(async () => {
    await startGlobals(app, true);
  });

  it('dummyTest', async () => {
    expect(1).toBe(1);
  });

  it('se debe obtener error en ficha de poliza', async () => {
    jest.spyOn(PolicyService.prototype, 'validatePolicePermission').mockImplementationOnce(async () => {
      return;
    });
    jest.spyOn(PolicyService.prototype, 'getPolicyFile').mockImplementation(async () => {
      throw new Error('Error ficha poliza');
    });

    const resp = await request(app)
      .get(prefix + '/file?id=168133065')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toEqual(500);
  });

  it('se debe obtener ficha de poliza', async () => {
    jest.spyOn(PolicyService.prototype, 'getPolicyFile').mockImplementationOnce(async () => ficha);
    jest.spyOn(PolicyService.prototype, 'validatePolicePermission').mockImplementationOnce(async () => {
      return;
    });

    const resp = await request(app)
      .get(prefix + '/file?id=168133065')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.body.contractor).toEqual(ficha.contractor);
    expect(resp.body.number).toBe(ficha.number);
  });

  it('se debe obtener resultado de busqueda de poliza', async () => {
    jest.spyOn(PolicyService.prototype, 'searchPolicies').mockImplementationOnce(async () => response);
    const resp = await request(app)
      .get(prefix + '/search?data=nombre&page=1&limit=2')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.body.data).toHaveLength(2);
    expect(resp.body.recordTotal).toBe(2);
  });

  it('se debe obtener error en resultado de busqueda de poliza', async () => {
    jest.spyOn(PolicyService.prototype, 'searchPolicies').mockImplementationOnce(async () => {
      throw new Error('Error busqueda poliza');
    });
    const resp = await request(app)
      .get(prefix + '/search?data=nombre&page=1&limit=2')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toBe(500);
  });
});
