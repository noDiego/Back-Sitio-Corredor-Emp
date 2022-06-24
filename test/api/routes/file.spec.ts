import { iUserSSO, startGlobals } from '../../helpers/globalMocks';
import express from 'express';
import request from 'supertest';
import FileService from '../../../src/application/services/fileService';
import InsuredService from '../../../src/application/services/insuredService';
import { Container } from 'typedi';
import { IResponseFileDTO } from '../../../src/utils/interfaces/IResponse';
import PolicyService from "../../../src/application/services/policyService";

const app = express();
const prefix = '/v1/file';

describe('File Route', () => {
  beforeAll(async () => {
    await startGlobals(app, true);
  });

  beforeEach(() => {
    Container.set('FileService', new FileService());
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('dummyTest', async () => {
    expect(1).toBe(1);
  });

  it('se debe obtener el pdf del certificado del producto', async () => {
    const policyNumber = 386778;
    const insuredId = '19834039-8';
    const productId = 3346546375686;
    const getProductCerticated = jest.spyOn(FileService.prototype, 'getProductCerticated');

    getProductCerticated.mockImplementation(async () => Buffer.from(''));

    const resp = await request(app)
      .get(
        prefix +
          '/insured/certificated?policyNumber=' +
          policyNumber +
          '&insuredId=' +
          insuredId +
          '&productId=' +
          productId
      )
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(200);
    expect(getProductCerticated).toHaveBeenCalledWith(policyNumber, insuredId, productId, iUserSSO);
  });

  it('se debe obtener error al llamar a servicio de pdf del certificado del producto', async () => {
    const policyNumber = 386778;
    const insuredId = '19834039-8';
    const productId = 3346546375686;
    const getProductCerticatedSpy = jest.spyOn(FileService.prototype, 'getProductCerticated');

    getProductCerticatedSpy.mockImplementation(async () => {
      throw new Error('Error certificado pdf');
    });

    const resp = await request(app)
      .get(
        prefix +
          '/insured/certificated?policyNumber=' +
          policyNumber +
          '&insuredId=' +
          insuredId +
          '&productId=' +
          productId
      )
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(500);
    expect(getProductCerticatedSpy).toHaveBeenCalledWith(policyNumber, insuredId, productId, iUserSSO);
  });

  it('se debe obtener el pdf de la cobertura', async () => {
    const downloadToken = 334654633175686;
    const getFileSpy = jest.spyOn(FileService.prototype, 'getFile');
    const respFile: IResponseFileDTO = {
      code: 0,
      fileName: 'test',
      message: 'OK',
      mimeType: 'application/pdf',
      file: Buffer.from('')
    };

    getFileSpy.mockImplementation(async () => respFile);

    const resp = await request(app)
      .get(prefix + '/policy/plan/coverage?downloadToken=' + downloadToken)
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(200);
    expect(getFileSpy).toHaveBeenCalledWith(downloadToken, iUserSSO);
  });

  it('se debe obtener error en el servicio de pdf de la cobertura', async () => {
    const downloadToken = 334654633175686;
    const getFileSpy = jest.spyOn(FileService.prototype, 'getFile');

    getFileSpy.mockImplementation(async () => {
      throw new Error('error servicio pdf');
    });

    const resp = await request(app)
      .get(prefix + '/policy/plan/coverage?downloadToken=' + downloadToken)
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(500);
    expect(getFileSpy).toHaveBeenCalledWith(downloadToken, iUserSSO);
  });

  it('se debe obtener el pdf del contrato del plan', async () => {
    const fileMock = Buffer.from('');
    const downloadToken = 334654633175686;
    const getPolicyContractSpy = jest.spyOn(FileService.prototype, 'getPolicyContract');

    getPolicyContractSpy.mockImplementation(async () => fileMock);

    const resp = await request(app)
      .get(prefix + '/policy/contract?downloadToken=' + downloadToken)
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(200);
    expect(getPolicyContractSpy).toHaveBeenCalledWith(downloadToken, iUserSSO);
  });

  it('se debe obtener error en el servicio de pdf del contrato del plan', async () => {
    const downloadToken = 334654633175686;
    const getPolicyContractSpy = jest.spyOn(FileService.prototype, 'getPolicyContract');

    getPolicyContractSpy.mockImplementation(async () => {
      throw new Error('Error');
    });

    const resp = await request(app)
      .get(prefix + '/policy/contract?downloadToken=' + downloadToken)
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(500);
    expect(getPolicyContractSpy).toHaveBeenCalledWith(downloadToken, iUserSSO);
  });

  it('se debe obtener el xlsx de asegurados', async () => {
    const fileMock = Buffer.from('');
    const poliza = 282165;
    const somethingSpy = jest.spyOn(InsuredService.prototype, 'generateXLSNomina');
    jest.spyOn(PolicyService.prototype, 'validatePolicePermission').mockImplementationOnce(async () => {
      return;
    });

    somethingSpy.mockImplementation(async () => fileMock);

    const resp = await request(app)
      .get(prefix + '/insureds?policyNumber=' + poliza)
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(200);
    expect(somethingSpy).toHaveBeenCalledWith(poliza, iUserSSO);
  });

  it('se debe obtener error al llamar a xlsx de asegurados', async () => {
    const poliza = 282165;
    const somethingSpy = jest.spyOn(InsuredService.prototype, 'generateXLSNomina');
    jest.spyOn(PolicyService.prototype, 'validatePolicePermission').mockImplementationOnce(async () => {
      return;
    });

    somethingSpy.mockImplementation(async () => {
      throw new Error('Error');
    });

    const resp = await request(app)
      .get(prefix + '/insureds?policyNumber=' + poliza)
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(500);
    expect(somethingSpy).toHaveBeenCalledWith(poliza, iUserSSO);
  });

  it('se debe obtener reporte/s', async () => {
    const report = {
      policy: '282020',
      totalMount: 107000,
      invoices: [],
      reports: []
    };

    const fileBuffer = Buffer.from('123');

    const responseFileDTO: IResponseFileDTO = {
      code: 0,
      file: fileBuffer,
      fileName: 'test',
      message: 'test',
      mimeType: 'test'
    };

    jest.spyOn(FileService.prototype, 'downloadCollectionReports').mockImplementationOnce(async () => responseFileDTO);

    const resp = await request(app)
      .post(prefix + '/collection/reports')
      .set('Auth-Token', '12345')
      .send({ reports: [report] });
    expect(resp.status).toEqual(200);
    expect(jest.spyOn(FileService.prototype, 'downloadCollectionReports')).toHaveBeenCalled();
  });
});
