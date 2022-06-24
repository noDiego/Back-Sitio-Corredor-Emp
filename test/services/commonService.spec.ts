import { Container } from 'typedi';
import logger from '../../src/loaders/logger';
import CommonService from '../../src/application/services/commonService';
import { bancosDummy, previsionesDummy } from '../../src/dummy/bancos';
import { ciudadesDummy, comunasDummy, regionesDummy } from '../../src/dummy/localidad';
import { ILocalidad } from '../../src/domain/interfaces/dto/v1/ILocalidad';
import { IUserSSO } from '../../src/domain/interfaces/dto/v3/IUserSSO';
import { startGlobals, iUserSSO, resetMocks } from '../helpers/globalMocks';
import CommonApi from '../../src/infrastructure/clients/commonApi';

describe('commonService', () => {
  Container.set('logger', logger);
  let commonService: CommonService;

  beforeAll(async () => {
    Container.set('logger', logger);
    await startGlobals(null);
    commonService = Container.get(CommonService);
  });
  afterAll(() => {
    resetMocks();
  });

  it('CommonService be defined', () => {
    expect(commonService).toBeDefined();
  });

  it('listaBancos OK', async () => {
    jest.spyOn(CommonApi.prototype, 'getCategories').mockImplementation(async () => bancosDummy);

    const resp = await commonService.listaBancos(iUserSSO);
    expect(resp).toEqual(expect.any(Array));
  });

  it('listaPrevisiones OK', async () => {
    jest.spyOn(CommonApi.prototype, 'getCategories').mockImplementation(async () => previsionesDummy);

    const resp = await commonService.listaPrevisiones(iUserSSO);
    expect(resp).toEqual(expect.any(Array));
  });

  it('listaRegiones OK', async () => {
    jest.spyOn(CommonApi.prototype, 'getCategories').mockImplementation(async () => regionesDummy);
    jest.spyOn(CommonApi.prototype, 'getCities').mockImplementation(async () => ciudadesDummy);
    jest.spyOn(CommonApi.prototype, 'getCommunes').mockImplementation(async () => comunasDummy);

    const resp: ILocalidad[] = await commonService.listaRegiones(iUserSSO);
    expect(resp).toHaveLength(15);
    expect(resp[0].ciudades).toEqual(expect.any(Array));
  });
});
