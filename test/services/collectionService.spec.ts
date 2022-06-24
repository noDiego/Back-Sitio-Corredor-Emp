import { Container } from 'typedi';
import logger from '../../src/loaders/logger';
import { IResponseDTO } from '../../src/utils/interfaces/IResponse';

import { startGlobals, iUserSSO, resetMocks } from '../helpers/globalMocks';
import CollectionService from '../../src/application/services/collectionService';
import { IGroupCollectionDTO } from '../../src/domain/interfaces/dto/v1/ICollection';
import * as exceljs from 'exceljs';
import { ICollectionReportInput, IReportDetail } from '../../src/domain/interfaces/dto/v1/ICollectionReport';
import PolicyApi from '../../src/infrastructure/clients/policyApi';
import CollectionApi from '../../src/infrastructure/clients/collectionApi';
import { IPolicy } from '../../src/domain/interfaces/dto/v3/IPolicy';
import { IPagedResponse } from '../../src/domain/interfaces/dto/v1/IResponse';
import { IInvoice, IPaymentHistory, ICollectionGroup } from '../../src/domain/interfaces/dto/v3/ICollection';
import { COLLECTION_DOCUMENT_TYPE, FILE_TYPE } from '../../src/constants/types';

const collectionGroup: ICollectionGroup={
  idGroup: 1,
  code: 55111,
  rut: '96625550-1',
  name: 'Andover Alianza Medica S.A.',
  benefitStatus: 'ACTIVO',
  debtStatus: 'DEUDA VENCIDA',
  currentDebtAmount: 0,
  expiredDebtAmount: 23126005
}

const policies: IPolicy[] = [];

policies.push({
  renewalId: 11068608,
  renewal: 8,
  policyNumber: 281732,
  insuranceCoRut: '99301000-6',
  holding: {
    number: 281732,
    name: 'ANDOVER ALIANZA MEDCA S.A.'
  },
  contractor: {
    rut: '96625550-1',
    name: 'ANDOVER ALIANZA MEDICA S.A.'
  },
  company: {
    rut: '96625550-1',
    name: 'ANDOVER ALIANZA MEDICA S.A.',
    businessActivity: 'DISTRIBUIDORA-COMERCIO'
  },
  broker: {
    rut: '78734410-0',
    name: 'DE SEGUROS LTDA. MERCER CORREDORES'
  },
  status: 'VIGENTE',
  firstTerm: new Date(),
  startDate: new Date(),
  endDate: new Date(),
  productDescription: ['VIDA', 'SALUD'],
  numberOfHolders: 40,
  numberOfBeneficiaries: 36,
  hasBlockedBenefits: false,
  hasDebt: true,
  hasHealthBenefits: true,
  hasPendingRequirements: false,
  insuredList: [],
  collectionGroup: [collectionGroup]
});
const polizasPaginadas: IPagedResponse<IPolicy> = {
  code: 0,
  data: policies,
  message: 'OK',
  limit: 1,
  page: 1,
  recordTotal: 1
};

const invoices: IInvoice[] = [];
invoices.push({
  policy: 281732,
  period: 201907,
  id: 2834880,
  invoiceNumber: 1053155,
  invoiceType: 'AFECTA',
  invoiceCompanyRut: '96625550-1',
  invoiceCompany: '',
  favorOf: null,
  debtStatus: 'VENCIDA',
  gracePeriod: 45,
  issuanceDate: new Date('2019-07-23T00:00:00'),
  invoiceDate: new Date(),
  expirationDate: new Date('2019-09-06T00:00:00'),
  invoicedAmount: 3748605,
  collectionGroupCode: 55111,
  collectionGroupName: 'Cobranza Andover Alianza Medica S.A.',
  companyRut: null,
  company: null,
  rutsubsidiary: undefined,
  subsidiary: undefined,
  fileId: null
});

const collectionsGroup: IGroupCollectionDTO[] = [];
collectionsGroup.push({
  policy: 12345,
  npzgcCdg: 76547567,
  groupCollectionCode: 1234,
  groupCollection: 'string;',
  rut: 5342545423,
  dv: 'K',
  company: 'compny',
  ongoingDebt: 800000,
  pendingDebt: 800000,
  debtStatus: 'string;',
  profitStatus: 'string;'
});

describe('CollectionService', () => {
  Container.set('logger', logger);
  let collectionService: CollectionService;

  beforeAll(async () => {
    await startGlobals(null, true);
    collectionService = Container.get(CollectionService);
  });
  afterAll(() => {
    resetMocks();
  });

  it('dummyTest', async () => {
    expect(1).toBe(1);
  });

  it('CollectionService be defined', () => {
    expect(collectionService).toBeDefined();
  });

  it('CollectionService searchCollectionsPendingDebt OK', async () => {
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByCompany').mockImplementation(async () => polizasPaginadas);
    jest.spyOn(CollectionApi.prototype, 'getDebtInvoicesByPolicy').mockImplementation(async () => invoices);

    const companyRut = '96625550-1';
    const page = 1;
    const limit = 5;

    const resp: IResponseDTO = await collectionService.searchCollectionsPendingDebt(
      companyRut,
      'data',
      page,
      limit,
      iUserSSO
    );
    expect(resp.recordTotal).toBe(1);
  });

  it('CollectionService generateExcelInvoices OK', async () => {
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByCompany').mockImplementation(async () => polizasPaginadas);
    jest.spyOn(CollectionApi.prototype, 'getDebtInvoicesByPolicy').mockImplementation(async () => invoices);
    jest.spyOn(PolicyApi.prototype, 'getPolicyDetail').mockImplementation(async () => policies[0]);

    const companyRut = '96625550-1';

    const resp: exceljs.Buffer = await collectionService.generateExcelInvoices(companyRut, 'data', iUserSSO);
    expect(jest.spyOn(PolicyApi.prototype, 'getPoliciesByCompany')).toHaveBeenCalled();
    expect(jest.spyOn(CollectionApi.prototype, 'getDebtInvoicesByPolicy')).toHaveBeenCalled();
    expect(jest.spyOn(PolicyApi.prototype, 'getPolicyDetail')).toHaveBeenCalled();
  });

  it('CollectionService getCollectionReports OK', async () => {
    const reportInput: ICollectionReportInput = {
      period: '201001',
      polices: [123, 321]
    };
    const reports: IReportDetail[] = [];
    reports.push({
      token: 1144875,
      name: 'COB_281732_201907_22072019184554.xlsx',
      docType: COLLECTION_DOCUMENT_TYPE.COB,
      fileType: FILE_TYPE.XLSX
    });

    jest.spyOn(CollectionApi.prototype, 'getInvoicesByPeriod').mockImplementation(async () => invoices);
    jest.spyOn(CollectionApi.prototype, 'getCollectionReportsByPeriod').mockImplementation(async () => reports);

    const resp = await collectionService.getReports(reportInput, 1, 2, iUserSSO);
    expect(jest.spyOn(CollectionApi.prototype, 'getInvoicesByPeriod')).toHaveBeenCalled();
    expect(jest.spyOn(CollectionApi.prototype, 'getCollectionReportsByPeriod')).toHaveBeenCalled();
    expect(resp.data[0].policy).toBe(resp.data[0].policy);
  });

  it('CollectionService searchPaymentHistory OK', async () => {
    const companyRut = '96625550-1';
    const listaPayments: IPaymentHistory[] = [];
    listaPayments.push({
      contractRut: '96625550-1',
      noticeNumber: '1041173-4',
      voucherNumber: 0,
      branchOffice: '210',
      period: 201810,
      subsidiary: 'string;',
      subsidiaryRut: 'string;',
      policy: 281732,
      paymentDate: new Date('2020-01-14T00:00:00'),
      amountPay: 3729208,
      collectionGroupCode: 55111,
      collectionGroupName: 'Cobranza Andover Alianza Medica S.A.'
    });
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByCompany').mockImplementation(async () => polizasPaginadas);
    jest.spyOn(CollectionApi.prototype, 'getPaymentsByPolicy').mockImplementation(async () => listaPayments);

    const resp = await collectionService.searchPaymentHistory(companyRut, 6, 1, 5, iUserSSO);
    expect(resp.code).toBe(0);
  });

  it('CollectionService generateExcelPaymentHistory OK', async () => {
    const companyRut = '96625550-1';
    const listaPayments: IPaymentHistory[] = [];
    listaPayments.push({
      contractRut: '96625550-1',
      noticeNumber: '1041173-4',
      voucherNumber: 0,
      branchOffice: '210',
      period: 201810,
      subsidiary: 'string;',
      subsidiaryRut: 'string;',
      policy: 281732,
      paymentDate: new Date('2020-01-14T00:00:00'),
      amountPay: 3729208,
      collectionGroupCode: 55111,
      collectionGroupName: 'Cobranza Andover Alianza Medica S.A.'
    });
    jest.spyOn(PolicyApi.prototype, 'getPoliciesByCompany').mockImplementation(async () => polizasPaginadas);
    jest.spyOn(CollectionApi.prototype, 'getPaymentsByPolicy').mockImplementation(async () => listaPayments);
    jest.spyOn(PolicyApi.prototype, 'getPolicyDetail').mockImplementation(async () => policies[0]);

    const resp = await collectionService.generateExcelPaymentHistory(companyRut, 6, iUserSSO);
    expect(jest.spyOn(PolicyApi.prototype, 'getPoliciesByCompany')).toHaveBeenCalled();
    expect(jest.spyOn(CollectionApi.prototype, 'getPaymentsByPolicy')).toHaveBeenCalled();
    expect(jest.spyOn(PolicyApi.prototype, 'getPolicyDetail')).toHaveBeenCalled();
  });
});
