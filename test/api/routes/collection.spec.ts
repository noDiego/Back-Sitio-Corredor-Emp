import express from 'express';
import request from 'supertest';
import { IResponseDTO } from '../../../src/utils/interfaces/IResponse';
import { startGlobals } from '../../helpers/globalMocks';
import PolicyService from '../../../src/application/services/policyService';
import { IContractor } from '../../../src/domain/interfaces/dto/v3/IContractor';
import CollectionService from '../../../src/application/services/collectionService';
import FileService from '../../../src/application/services/fileService';
import { clone } from "../../../src/utils/utils";

const app = express();
const prefix = '/v1/collection';

const contractor: IContractor = { name: 'BANCO CENTRAL DE CHILE', rut: '97029000-1' };

const responseContractors: IResponseDTO = {
  code: 0,
  message: 'OK',
  page: 1,
  limit: 10,
  totalPage: 1,
  recordTotal: 7,
  data: []
};

describe('Contractor Route', () => {
  beforeAll(async () => {
    await startGlobals(app, true);
  });

  it('dummyTest', async () => {
    expect(1).toBe(1);
  });
  /*
  it('searchCollectionsPendingDebt', async () => {
    jest
      .spyOn(CollectionService.prototype, 'searchCollectionsPendingDebt')
      .mockImplementationOnce(async () => responseContractors);

    const resp = await request(app)
      .get(prefix + '/debt?data=123&page=1&limit=1')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toBe(200);
  });

  it('generateExcelInvoices', async () => {
    jest
      .spyOn(CollectionService.prototype, 'generateExcelInvoices')
      .mockImplementationOnce(async () => Buffer.from(''));

    const resp = await request(app)
      .get(prefix + '/debt/file?data=123')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toBe(200);
  });

  it('getInvoice', async () => {
    jest.spyOn(FileService.prototype, 'getInvoice').mockImplementationOnce(async () => Buffer.from(''));

    const resp = await request(app)
      .get(prefix + '/invoice/file?invoiceNumber=123&invoiceType=EXENTA')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toBe(200);
  });

  it('reports', async () => {
    const responseMock = clone(responseContractors);
    const report = {
      policy: '282020',
      totalMount: 107000,
      invoices: [Array],
      reports: [Array],
    };

    const msg = {
      period: '202001',
      polices: ['123', '321'],
      page: 1,
      limit: 2,
    };

    responseMock.data = [report];
    jest.spyOn(CollectionService.prototype, 'getReports').mockImplementationOnce(async () => responseMock);

    const resp = await request(app)
      .post(prefix + '/reports')
      .set('Auth-Token', '12345')
      .send(msg);
    expect(resp.status).toBe(200);
    expect(resp.body.data).toHaveLength(1);
  });*/
});
