import { iUserSSO, mockCircuitResponse, resetMocks, startGlobals } from '../../helpers/globalMocks';
import { Container } from 'typedi';
import CommonApi from '../../../src/infrastructure/clients/commonApi';
import CollectionApi from '../../../src/infrastructure/clients/collectionApi';
import { Invoice, InvoiceResponse } from '../../../src/infrastructure/clients/dto/invoice';
import { IInvoice, InvoiceType, IPaymentHistory } from '../../../src/domain/interfaces/dto/v3/ICollection';
import { PaymentResponse } from '../../../src/infrastructure/clients/dto/payment';
import { BillingPDF, CollectionResponse, TokenInfo } from '../../../src/infrastructure/clients/dto/collection';
import { COLLECTION_DOCUMENT_TYPE } from '../../../src/constants/types';
import { IReportDetail } from '../../../src/domain/interfaces/dto/v1/ICollectionReport';
import { CircuitBreaker } from '../../../src/utils/circuitBreaker/circuitBreaker';
import { clone } from "../../../src/utils/utils";

const invoice: Invoice = {
  policyNumber: '281732',
  coveragePeriod: 201907,
  billId: 2834880,
  invoice: 1053155,
  noticeNumber: '1055418-7',
  billType: 'AFECTA',
  billRut: '96625550-1',
  socialReason: 'Andover Alianza Medica S.A.',
  inFavorOf: null,
  paymentStatus: 'PENDIENTE',
  debtStatus: 'VENCIDA',
  periodOfGrace: 45,
  collectionIssueDate: new Date('2019-07-23T00:00:00'),
  invoiceDate: new Date('2019-07-23T00:00:00'),
  expirationDate: new Date('2019-09-06T00:00:00'),
  billedAmount: 3748605,
  ivaAmount: 598517,
  collectionGroup: {
    id: 1,
    code: 55111,
    nameGroup: 'Cobranza Andover Alianza Medica S.A.'
  }
};

describe('CommonApi', () => {
  let collectionApi: CollectionApi;

  beforeAll(async () => {
    await startGlobals();
    collectionApi = Container.get(CollectionApi);
  });

  afterAll(() => {
    resetMocks();
  });

  it('CollectionApi be defined', () => {
    expect(collectionApi).toBeDefined();
  });

  it('getDebtInvoicesByPolicy OK', async () => {
    const categoryResponse: InvoiceResponse = { bill: [invoice] };

    mockCircuitResponse(categoryResponse, 200);

    const invoices: IInvoice[] = await collectionApi.getDebtInvoicesByPolicy(123654, iUserSSO);

    expect(invoices).toBeDefined();
    expect(invoices).toHaveLength(1);
    expect(invoices[0].invoiceCompanyRut).toBe(invoice.billRut);
  });

  it('getDebtInvoicesByPolicy NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const invoices = await collectionApi.getDebtInvoicesByPolicy(123654, iUserSSO);

    expect(invoices).toBe(null);
  });

  it('getPaymentsByPolicy OK', async () => {
    const paymentResponse: PaymentResponse = {
      payment: [
        {
          policyNumber: 281732,
          notificationNumber: '1041173-4',
          paymentDate: new Date('2020-01-14T00:00:00'),
          amount: 3729208,
          branch: 210,
          channel: ' ',
          voucher: 0,
          rutInvoice: '96625550-1',
          invoiceName: 'Andover Alianza Medica S.A.',
          coveragePeriod: 201810,
          collectionGroup: {
            id: 1,
            code: 55111,
            nameGroup: 'Cobranza Andover Alianza Medica S.A.'
          }
        },
        {
          policyNumber: 281732,
          notificationNumber: '1055418-7',
          paymentDate: new Date('2020-01-14T00:00:00'),
          amount: 3896713,
          branch: 210,
          channel: ' ',
          voucher: 0,
          rutInvoice: '96625550-1',
          invoiceName: 'Andover Alianza Medica S.A.',
          coveragePeriod: 201907,
          collectionGroup: {
            id: 1,
            code: 55111,
            nameGroup: 'Cobranza Andover Alianza Medica S.A.'
          }
        }
      ]
    };

    mockCircuitResponse(paymentResponse, 200);

    const result: IPaymentHistory[] = await collectionApi.getPaymentsByPolicy(123654, new Date(), new Date(), iUserSSO);

    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(result[0].policy).toBe(paymentResponse.payment[0].policyNumber);
    expect(result[0].branchOffice).toBe(paymentResponse.payment[0].channel);
  });

  it('getPaymentsByPolicy NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const invoices = await collectionApi.getDebtInvoicesByPolicy(123654, iUserSSO);

    expect(invoices).toBe(null);
  });

  it('getInvoicesByPeriod OK', async () => {
    const responseMock: InvoiceResponse = { bill: [invoice] };

    mockCircuitResponse(responseMock, 200);

    const result: IInvoice[] = await collectionApi.getInvoicesByPeriod(123654, '201905', iUserSSO);

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0].invoiceCompanyRut).toBe(invoice.billRut);
  });

  it('getInvoicesByPeriod NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const result: IInvoice[] = await collectionApi.getInvoicesByPeriod(123654, '201905', iUserSSO);

    expect(result).toBe(null);
  });

  it('getCollectionReportsByPeriod OK', async () => {
    const responseMock: CollectionResponse = {
      collection: {
        policyNumber: 123456,
        tokenPayrollColletionExcel: {
          token: 123,
          docName: 'doc1',
          docType: COLLECTION_DOCUMENT_TYPE.COB
        },
        tokenPayrollColletionPDF: {
          token: 123,
          docName: 'doc1',
          docType: COLLECTION_DOCUMENT_TYPE.NOM
        },
        tokenMovementsColletionExcel: {
          token: 123,
          docName: 'doc1',
          docType: COLLECTION_DOCUMENT_TYPE.AJU
        },
        tokenMovementsColletionPDF: {
          token: 123,
          docName: 'doc1',
          docType: COLLECTION_DOCUMENT_TYPE.MOV
        },
        tokenCollectionNotices: {
          token: 123,
          docName: 'doc1',
          docType: COLLECTION_DOCUMENT_TYPE.AVI
        }
      }
    };

    mockCircuitResponse(responseMock, 200);

    const result: IReportDetail[] = await collectionApi.getCollectionReportsByPeriod(123654, '201905', iUserSSO);

    expect(result).toBeDefined();
    expect(result).toHaveLength(5);
    expect(result[0].token).toBe(123);
  });

  it('getCollectionReportsByPeriod NODATA', async () => {
    mockCircuitResponse(
      {
        httpCode: 404,
        httpMessage: 'SIN DATOS',
        moreInformation: 'SIN INFO'
      },
      404
    );

    const result: IReportDetail[] = await collectionApi.getCollectionReportsByPeriod(123654, '201905', iUserSSO);

    expect(result).toBe(null);
  });

  it('getInvoicePDF OK', async () => {
    const responseMock: BillingPDF = { pdfFactura: '123' };

    const responseService = {
      data: responseMock,
      status: 200,
      statusText: 'string',
      headers: 'any',
      config: undefined,
      request: 'any'
    };

    const responseFile = {
      data: Buffer.from('Test'),
      status: 200,
      statusText: 'string',
      headers: 'any',
      config: undefined,
      request: 'any'
    };

    jest
      .spyOn(CircuitBreaker.prototype, 'exec')
      .mockImplementationOnce(() => Promise.resolve(responseService))
      .mockImplementationOnce(() => Promise.resolve(responseFile));

    const result: Buffer = await collectionApi.getInvoicePDF(123654, InvoiceType.AFECTA, 90101101, iUserSSO);

    expect(result).toBeDefined();
    expect(result).toHaveLength(4);
  });
});
