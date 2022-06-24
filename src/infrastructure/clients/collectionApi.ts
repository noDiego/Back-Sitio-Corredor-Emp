import { Inject, Service } from 'typedi';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { URLS } from '../../constants/urls';
import breakerInstance from '../../utils/circuitBreaker/breakerInstance';
import { CircuitBreaker } from '../../utils/circuitBreaker/circuitBreaker';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { getVSHeaders } from '../../constants/headers';
import winston from 'winston';
import { ICollectionAdapter } from '../../domain/interfaces/adapter/ICollectionAdapter';
import { Invoice, InvoiceResponse } from './dto/invoice';
import { Payment, PaymentResponse } from './dto/payment';
import { IInvoice, InvoiceType, IPaymentHistory } from '../../domain/interfaces/dto/v3/ICollection';
import invoiceConverter from './converters/invoiceConverter';
import { resolveError } from '../../utils/apiutils';
import { logError, logResponse } from '../../utils/logutils';
import { BillingPDF, CollectionResponse } from './dto/collection';
import { IReportDetail } from '../../domain/interfaces/dto/v1/ICollectionReport';
import collectionReportConverter from './converters/collectionReportConverter';
import paymentConverter from './converters/paymentConverter';
import moment from 'moment';

@Service('CollectionApi')
export default class CollectionApi implements ICollectionAdapter {
  @Inject('logger') private readonly logger: winston.Logger;

  async getDebtInvoicesByPolicy(policyNumber: number, userSSO: IUserSSO): Promise<IInvoice[]> {
    const serviceName = 'InvoicesDebtByPolicy';
    const urlApi: string = URLS.collectionApi.billingPendingByPolicy + policyNumber + '/query';
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a getDebtInvoicesByPolicy con policyNumber: ' + policyNumber);
    this.logger.debug('URL Service: ' + urlApi);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO)
    };

    try {
      const response: AxiosResponse<InvoiceResponse> = await axiosBreaker.exec<InvoiceResponse>(axiosRequest, true);
      logResponse(response, urlApi, userSSO.transactionID);

      const invoiceList: IInvoice[] = [];

      response.data.bill.forEach((invoice: Invoice) => {
        const invoiceConverted: IInvoice = invoiceConverter(invoice);
        invoiceList.push(invoiceConverted);
      });
      return invoiceList;
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getPaymentsByPolicy(
    policyNumber: number,
    startDate: Date,
    endDate: Date,
    userSSO: IUserSSO
  ): Promise<IPaymentHistory[]> {
    const serviceName = 'PaymentsByPolicy';
    const urlApi: string = URLS.collectionApi.paymentsByPolicy + policyNumber;
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a getPaymentsByPolicy con policyNumber: ' + policyNumber);
    this.logger.debug('URL Service: ' + urlApi);

    let params: any = {};
    if (startDate && endDate) {
      params = {
        FechaDesde: moment(startDate).format('DD-MM-YYYY'),
        FechaHasta: moment(endDate).format('DD-MM-YYYY')
      };
    }
    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<PaymentResponse> = await axiosBreaker.exec<PaymentResponse>(axiosRequest, true);
      logResponse(response, urlApi, userSSO.transactionID);

      const paymentList: IPaymentHistory[] = [];

      response.data.payment.forEach((payment: Payment) => {
        const paymentConverted: IPaymentHistory = paymentConverter(payment);
        paymentList.push(paymentConverted);
      });
      return paymentList;
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getInvoicesByPeriod(policyNumber: number, period: string, userSSO: IUserSSO): Promise<IInvoice[]> {
    const serviceName = 'InvoicesByPeriod';
    const urlApi: string = URLS.collectionApi.billingByPeriod + policyNumber + '/query';
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a getInvoicesByPeriod con policyNumber: ' + policyNumber);
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      Period: period
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<InvoiceResponse> = await axiosBreaker.exec<InvoiceResponse>(axiosRequest, true);
      logResponse(response, urlApi, userSSO.transactionID);

      const invoiceList: IInvoice[] = [];

      response.data.bill.forEach((invoice: Invoice) => {
        const invoiceConverted: IInvoice = invoiceConverter(invoice);
        invoiceList.push(invoiceConverted);
      });
      return invoiceList;
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getCollectionReportsByPeriod(
    policyNumber: number,
    period: string,
    userSSO: IUserSSO
  ): Promise<IReportDetail[]> {
    const serviceName = 'CollectionReportsByPeriod';
    const urlApi: string = URLS.collectionApi.collectionsByPeriod + policyNumber + '/query';
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a getInvoicesByPeriod con policyNumber: ' + policyNumber);
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      Period: period
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<CollectionResponse> = await axiosBreaker.exec<CollectionResponse>(
        axiosRequest,
        true
      );
      logResponse(response, urlApi, userSSO.transactionID);

      return collectionReportConverter(response.data.collection);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  async getInvoicePDF(invoice: number, type: InvoiceType, rutCo: number, userSSO: IUserSSO): Promise<Buffer> {
    const serviceName = 'InvoicePDF';
    const urlApi: string = URLS.collectionApi.billingDocument + invoice;
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a ' + serviceName + ' con invoice: ' + invoice);
    this.logger.debug('URL Service: ' + urlApi);

    const params: any = {
      RutCo: rutCo,
      Type: type.valueOf()
    };

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO),
      params: params
    };

    try {
      const response: AxiosResponse<BillingPDF> = await axiosBreaker.exec<BillingPDF>(axiosRequest, false);
      logResponse(response, urlApi, userSSO.transactionID);

      return response.data.pdfFactura ? await this.getInvoicePDFFile(response.data.pdfFactura) : null;
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }

  private async getInvoicePDFFile(fileUrl: string): Promise<Buffer> {
    const serviceName = 'InvoicePDFFile';
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.debug('Descargando Invoice desde:' + fileUrl);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: fileUrl,
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/pdf'
      }
    };

    try {
      const response: AxiosResponse<Buffer> = await axiosBreaker.exec<Buffer>(axiosRequest, false);
      return response.data;
    } catch (error) {
      logError(error, fileUrl);
      return resolveError(error, serviceName);
    }
  }
}
