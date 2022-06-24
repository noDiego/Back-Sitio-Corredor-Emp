import { Container } from 'typedi';
import HoldingService from '../../src/application/services/holdingService';
import logger from '../../src/loaders/logger';
import { IHoldingDTO } from '../../src/domain/interfaces/dto/v1/IHolding';
import { IContractor } from '../../src/domain/interfaces/dto/v3/IContractor';
import { IUserSSO } from '../../src/domain/interfaces/dto/v3/IUserSSO';
import { resetMocks } from '../helpers/globalMocks';

const listaContractor1: IContractor[] = [];
listaContractor1.push({
  name: 'BUSSENIUS Y TRINCADO LIMITADA',
  rut: '78.150.860-8',
  address: 'Huérfanos 1273, Santiago',
  bussinessLine: 'Asesoria',
  contactName: 'GASTON DAMIAN PAREDES ROJAS',
  contactPhone: '9967845634',
  contactEmail: 'gaston.paredes@BT.com',
  totalPolicies: 1
});

const listaContractor2: IContractor[] = [];
listaContractor2.push({
  name: 'BANCO CENTRAL DE CHILE',
  rut: '97.029.000-1',
  address: 'Agustinas 1180, Santiago Chile',
  bussinessLine: 'Servicios Financieros',
  contactName: 'DE SEGUROS LTDA. MERCER CORREDORES',
  contactPhone: '9967845635',
  contactEmail: 'mercercorredores@bancocentral.cl',
  totalPolicies: 13
});

const listaHolding: IHoldingDTO[] = [];
listaHolding.push({
  code: '283054',
  name: 'BANCO CENTRAL DE CHILE ',
  totalContractors: 1,
  contractors: listaContractor2
});
listaHolding.push({
  code: '281683',
  name: 'OTEC',
  totalContractors: 1,
  contractors: listaContractor1
});

describe('holdingService', () => {
  Container.set('logger', logger);
  const holdingService: HoldingService = Container.get(HoldingService);
  afterAll(() => {
    resetMocks();
  });

  it('PolicyService be defined', () => {
    expect(holdingService).toBeDefined();
  });

  it('getInsuredFile OK', async () => {
    const client: IUserSSO = {
      sub: 'subEjemplo',
      name: 'Juan Perez',
      preferredUsername: 'jperez',
      givenName: 'Juan',
      familyName: 'Perez',
      email: 'juanperez@mail.com'
    };
    const resp = await holdingService.getHolding(client);
    expect(resp.length).toBe(listaHolding.length);
  });
});
