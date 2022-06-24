import express from 'express';
import request from 'supertest';
import { IResponseDTO } from '../../../src/utils/interfaces/IResponse';
import { startGlobals } from '../../helpers/globalMocks';
import PolicyService from '../../../src/application/services/policyService';
import { IContractor } from '../../../src/domain/interfaces/dto/v3/IContractor';

const app = express();
const prefix = '/v1/contractors';

const contractor: IContractor = { name: 'BANCO CENTRAL DE CHILE', rut: '97029000-1' };

const responseContractors: IResponseDTO = {
  code: 0,
  message: 'OK',
  page: 1,
  limit: 10,
  totalPage: 1,
  recordTotal: 7,
  data: [
    {
      rut: '97029000-1',
      name: 'BANCO CENTRAL DE CHILE',
      address: 'CERRO LOS CONDORES Nº 121',
      bussinessLine: 'Sector Primario, Secundario y Terciario',
      holding: {
        code: '283054',
        name: 'BANCO CENTRAL DE CHILE '
      },
      policiesList: [
        {
          company: 'Compañia Ejemplo',
          business: {
            rut: '97029000-1',
            name: 'BANCO CENTRAL DE CHILE'
          },
          holding: {
            code: '283054',
            name: 'BANCO CENTRAL DE CHILE '
          },
          number: '283060',
          state: 'VIGENTE',
          startDate: '2019-06-01T04:00:00.000Z',
          endDate: '2021-05-31T04:00:00.000Z',
          firstTerm: '2020-06-01T04:00:00.000Z',
          renovation: '1',
          productoDescription: ['Salud']
        }
      ]
    }
  ]
};

describe('Contractor Route', () => {
  beforeAll(async () => {
    await startGlobals(app, true);
  });

  it('dummyTest', async () => {
    expect(1).toBe(1);
  });
  it('se debe obtener ficha de contractor', async () => {
    jest.spyOn(PolicyService.prototype, 'getContractor').mockImplementationOnce(async () => contractor);

    const resp = await request(app)
      .get(prefix + '/contractor?rutContractor=291860')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.body.rut).toBe(contractor.rut);
    expect(resp.status).toBe(200);
  });

  it('se debe obtener error en ficha de contractor', async () => {
    jest.spyOn(PolicyService.prototype, 'getContractor').mockImplementationOnce(async () => {
      throw new Error('Error al obtener ficha contractor');
    });

    const resp = await request(app)
      .get(prefix + '/contractor?rutContractor=291860')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toBe(500);
  }, 30000);

  it('se debe obtener listado de contractors', async () => {
    jest.spyOn(PolicyService.prototype, 'getContractors').mockImplementationOnce(async () => responseContractors);

    const resp = await request(app)
      .get(prefix + '?page=1&limit=1')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.body.data).toHaveLength(1);
    expect(resp.body.data[0].rut).toBe(responseContractors.data[0].rut);
    expect(resp.status).toBe(200);
  }, 30000);

  it('se debe obtener error en listado de contractors', async () => {
    jest.spyOn(PolicyService.prototype, 'getContractors').mockImplementationOnce(async () => {
      throw new Error('Error');
    });

    const resp = await request(app)
      .get(prefix + '?page=1&limit=1')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toBe(500);
  }, 30000);
});
