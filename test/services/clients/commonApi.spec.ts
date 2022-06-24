import { iUserSSO, mockCircuitResponse, resetMocks, startGlobals } from '../../helpers/globalMocks';
import { Container } from 'typedi';
import CommonApi from '../../../src/infrastructure/clients/commonApi';
import { ICodeObject } from '../../../src/domain/interfaces/dto/v3/ICodeObject';
import {
  CategoryResponse,
  CityResponse,
  CommuneResponse,
  FileResponse
} from '../../../src/infrastructure/clients/dto/common';
import { Ciudad, Comuna } from '../../../src/domain/interfaces/dto/v3/ILocalidad';

describe('CommonApi', () => {
  let commonApi: CommonApi;

  beforeAll(async () => {
    await startGlobals();
    commonApi = Container.get(CommonApi);
  });

  afterAll(() => {
    resetMocks();
  });

  it('CommonApi be defined', () => {
    expect(commonApi).toBeDefined();
  });

  it('getCategories OK', async () => {
    const categoryResponse: CategoryResponse = {
      category: {
        categoryCode: 'TestCode',
        categoryName: 'TestName',
        categoryElements: [{ code: '1', description: 'categoryDescription 1' }]
      }
    };

    mockCircuitResponse(categoryResponse, 200);

    const cats: ICodeObject[] = await commonApi.getCategories('001', iUserSSO);

    expect(cats).toBeDefined();
    expect(cats).toHaveLength(1);
    expect(cats[0].name).toBe('categoryDescription 1');
  });

  it('getCategories NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const cats: ICodeObject[] = await commonApi.getCategories('001', iUserSSO);

    expect(cats).toBe(null);
  });

  it('getCities OK', async () => {
    const categoryResponse: CityResponse = {
      cities: [{ cityCode: 'cityCodeTest', cityName: 'Santaigo', regionCode: 'RM' }]
    };

    mockCircuitResponse(categoryResponse, 200);

    const cats: Ciudad[] = await commonApi.getCities(iUserSSO);

    expect(cats).toBeDefined();
    expect(cats).toHaveLength(1);
    expect(cats[0].name).toBe('Santaigo');
    expect(cats[0].regCode).toBe('RM');
  });

  it('getCities NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const cats: ICodeObject[] = await commonApi.getCities(iUserSSO);

    expect(cats).toBe(null);
  });

  it('getCommunes OK', async () => {
    const categoryResponse: CommuneResponse = {
      communes: [
        {
          comuneCode: 'c01',
          comuneName: 'Quillota',
          cityCode: '46'
        },
        {
          comuneCode: 'c02',
          comuneName: 'Quilpue',
          cityCode: '26'
        }
      ]
    };

    mockCircuitResponse(categoryResponse, 200);

    const cats: Comuna[] = await commonApi.getCommunes(iUserSSO);

    expect(cats).toBeDefined();
    expect(cats).toHaveLength(2);
    expect(cats[0].name).toBe('Quillota');
    expect(cats[0].cityCode).toBe('46');
    expect(cats[1].name).toBe('Quilpue');
    expect(cats[1].cityCode).toBe('26');
  });

  it('getCommunes NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const cats: Comuna[] = await commonApi.getCommunes(iUserSSO);

    expect(cats).toBe(null);
  });

  it('getFileToken OK', async () => {
    const tokenFile = new File([new ArrayBuffer(1)], 'file.jpg');

    const fileResponse: FileResponse = {
      file: {
        base64: 'base64==',
        fileName: 'archivoprueba',
        fileExtension: 'xls'
      }
    };

    mockCircuitResponse(fileResponse, 200);

    const file = await commonApi.getFileToken(1000, iUserSSO);

    expect(file).toBeDefined();
    expect(file.base64).toBe('base64==');
  });

  it('getFileToken NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const file = await commonApi.getFileToken(1000, iUserSSO);

    expect(file).toBe(null);
  });
});
