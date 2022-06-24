import express from 'express';
import request from 'supertest';
import CommonService from '../../../src/application/services/commonService';
import { ILocalidad } from '../../../src/domain/interfaces/dto/v1/ILocalidad';
import { startGlobals } from '../../helpers/globalMocks';
import { bancosDummy, previsionesDummy } from '../../../src/dummy/bancos';

const app = express();
const prefix = '/v1/common';
const regiones: ILocalidad[] = [
  {
    code: '1',
    name: 'REGION DE TARAPACA',
    ciudades: [
      {
        code: '210',
        name: 'IQUIQUE',
        comunas: [
          {
            code: '210',
            name: 'IQUIQUE'
          }
        ]
      },
      {
        code: '211',
        name: 'HUARA',
        comunas: [
          {
            code: '211',
            name: 'HUARA'
          }
        ]
      }
    ]
  },
  {
    code: '2',
    name: 'REGION DE ANTOFAGASTA',
    ciudades: [
      {
        code: '220',
        name: 'TOCOPILLA',
        comunas: [
          {
            code: '220',
            name: 'TOCOPILLA'
          }
        ]
      },
      {
        code: '221',
        name: 'MARIA ELENA',
        comunas: [
          {
            code: '221',
            name: 'MARIA ELENA'
          }
        ]
      }
    ]
  }
];

describe('Common Route', () => {
  beforeAll(async () => {
    await startGlobals(app);
  });

  it('debe cargar dos datos de regiones', async () => {
    jest.spyOn(CommonService.prototype, 'listaRegiones').mockImplementationOnce(async () => regiones);

    const resp = await request(app)
      .get(prefix + '/regiones')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.body).toEqual(expect.any(Array));
  });

  it('debe dar error en servicio de regiones', async () => {
    jest.spyOn(CommonService.prototype, 'listaRegiones').mockImplementationOnce(async () => {
      throw new Error('Error Regiones');
    });

    const resp = await request(app)
      .get(prefix + '/regiones')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toEqual(500);
  });

  it('debe obtener listado de bancos', async () => {
    jest.spyOn(CommonService.prototype, 'listaBancos').mockImplementationOnce(async () => bancosDummy);

    const resp = await request(app)
      .get(prefix + '/bancos')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.body).toEqual(expect.any(Array));
  });

  it('debe dar error en servicio de listado de bancos', async () => {
    jest.spyOn(CommonService.prototype, 'listaBancos').mockImplementationOnce(async () => {
      throw new Error('Error Bancos');
    });

    const resp = await request(app)
      .get(prefix + '/bancos')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toEqual(500);
  });

  it('debe obtener listado de previsiones', async () => {
    jest.spyOn(CommonService.prototype, 'listaPrevisiones').mockImplementationOnce(async () => previsionesDummy);

    const resp = await request(app)
      .get(prefix + '/previsiones')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.body).toEqual(expect.any(Array));
  });

  it('debe dar error en servicio de listado de previsiones', async () => {
    jest.spyOn(CommonService.prototype, 'listaPrevisiones').mockImplementationOnce(async () => {
      throw new Error('Error previsiones');
    });

    const resp = await request(app)
      .get(prefix + '/previsiones')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toEqual(500);
  });
});
