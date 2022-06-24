import { Inject, Service } from 'typedi';
import * as exceljs from 'exceljs';
import moment from 'moment';
import { IResponseDTO } from '../../utils/interfaces/IResponse';
import {
  ICollectionReport,
  ICollectionReportInput,
  IReportDetail
} from '../../domain/interfaces/dto/v1/ICollectionReport';
import { ICollectionService } from '../../domain/interfaces/services/ICollectionService';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import CollectionApi from '../../infrastructure/clients/collectionApi';
import PolicyApi from '../../infrastructure/clients/policyApi';
import Utils from '../../utils/utils';
import { IPagedResponse } from '../../domain/interfaces/dto/v1/IResponse';
import { IPolicy } from '../../domain/interfaces/dto/v3/IPolicy';
import {
  getInvoiceType,
  ICollection,
  IInvoice,
  IPaymentHistory,
  ICollectionGroup
} from '../../domain/interfaces/dto/v3/ICollection';
import { DEBT_STATUS, INVOICE_DEBT_STATUS } from '../../constants/status';
import { COLLECTION_DOCUMENT_TYPE, FILE_TYPE } from '../../constants/types';
import { returnEmpty } from '../../utils/apiutils';
import { Logger } from '../../loaders/logger';
import config from '../../config';

@Service('CollectionService')
export default class CollectionService implements ICollectionService {
  @Inject('logger') private readonly logger: Logger;
  @Inject('CollectionApi') private readonly collectionApi: CollectionApi;
  @Inject('PolicyApi') private readonly policyApi: PolicyApi;

  public async searchCollectionsPendingDebt(
    companyRut: string,
    data: string,
    page: number,
    limit: number,
    user: IUserSSO
  ): Promise<IResponseDTO> {
    try {
      const rutInsuranceCO: string = Utils.RUTINSURANCECO;

      const listInvoices: IInvoice[] = [];
      let policiesResponse: IPagedResponse<IPolicy>;
      let policiesList: IPolicy[] = [];
      let pageService = 1;
      let totalPages: number;
      do {
        policiesResponse = await this.policyApi.getPoliciesByCompany(
          Utils.getRutNumber(companyRut),
          Utils.getRutNumber(rutInsuranceCO),
          pageService,
          config.VSQueryLimit,
          user
        );
        policiesList = policiesList.concat(policiesResponse.data);
        totalPages = policiesResponse.totalPage;
        pageService++;
      } while (pageService <= totalPages);

      if (policiesList.length == 0) return returnEmpty(page, limit);

      for (const policy of policiesList) {
        if (policy.hasDebt) {
          try {
            const listaInvoicesData: IInvoice[] = await this.collectionApi.getDebtInvoicesByPolicy(
              policy.policyNumber,
              user
            );
            if (listaInvoicesData) {
              listaInvoicesData.forEach((invoice: IInvoice) => {
                invoice.company = policy.company.name;
                invoice.companyRut = policy.company.rut;
                listInvoices.push(invoice);
              });
            }
          } catch (e) {
            this.logger.error('Error al buscar facturas para poliza: ' + policy.policyNumber);
          }
        }
      }

      if (listInvoices.length == 0) return returnEmpty(page, limit);
      const listCollections: ICollection[] = this.groupInvoiceByPolicyAndGroup(listInvoices);
      const startIndex: number = (page - 1) * limit;
      const endIndex: number = page * limit;
      const recordTotal: number = listCollections.length;
      const totalPage: number = Math.ceil(recordTotal / limit);

      const result: ICollection[] = listCollections.slice(startIndex, endIndex);

      return {
        code: 0,
        message: 'OK',
        data: result,
        page: page,
        limit: limit,
        totalPage: totalPage,
        recordTotal: recordTotal
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async generateExcelInvoices(companyRut: string, data: string, user: IUserSSO): Promise<exceljs.Buffer> {
    try {
      const rutInsuranceCO: string = Utils.RUTINSURANCECO;

      const listInvoices: IInvoice[] = [];
      let policiesResponse: IPagedResponse<IPolicy>;
      let policiesList: IPolicy[] = [];
      let pageService = 1;
      let totalPages: number;
      do {
        policiesResponse = await this.policyApi.getPoliciesByCompany(
          Utils.getRutNumber(companyRut),
          Utils.getRutNumber(rutInsuranceCO),
          pageService,
          config.VSQueryLimit,
          user
        );
        policiesList = policiesList.concat(policiesResponse.data);
        totalPages = policiesResponse.totalPage;
        pageService++;
      } while (pageService <= totalPages);

      if (policiesList.length == 0) this.logger.error('generateExcelInvoices - Sin datos de polizas');

      for (const policy of policiesList) {
        if (policy.hasDebt) {
          const policyData: IPolicy = await this.policyApi.getPolicyDetail(policy.policyNumber, user);
          const listaInvoicesData: IInvoice[] = await this.collectionApi.getDebtInvoicesByPolicy(
            policy.policyNumber,
            user
          );
          if (listaInvoicesData) {
            listaInvoicesData.forEach((invoice: IInvoice) => {
              const colletionGroup: ICollectionGroup = policyData.collectionGroup.find(
                (cg: ICollectionGroup) => cg.code == invoice.collectionGroupCode
              );
              invoice.company = policy.company.name;
              invoice.companyRut = policy.company.rut;
              invoice.rutsubsidiary = colletionGroup ? colletionGroup.rut : '';
              invoice.subsidiary = colletionGroup ? colletionGroup.name : '';
              listInvoices.push(invoice);
            });
          }
        }
      }
      if (!listInvoices) {
        this.logger.error('generateExcelInvoices - Sin datos de facturas');
      }

      const workbook: exceljs.Workbook = new exceljs.Workbook();
      workbook.creator = 'VidaSecurity';
      workbook.modified = new Date();
      const sheet: exceljs.Worksheet = workbook.addWorksheet('Invoices');
      sheet.columns = [
        { header: 'ID_FACTURA', width: 15 },
        { header: 'NUMERO_POLIZA', width: 15 },
        { header: 'PERIODO', width: 20 },
        { header: 'NUMERO_FOLIO', width: 20 },
        { header: 'TIPO_FACTURA', width: 25 },
        { header: 'RUT_EMPRESA', width: 20 },
        { header: 'NOMBRE_EMPRESA', width: 40 },
        { header: 'RUT_FILIAL', width: 20 },
        { header: 'NOMBRE_FILIAL', width: 40 },
        { header: 'A_FAVOR_DE', width: 20 },
        { header: 'ESTADO_DEUDA', width: 25 },
        { header: 'PLAZO_GRACIA', width: 18 },
        { header: 'FECHA_EMISION', width: 20 },
        { header: 'FECHA_FACTURACION', width: 18 },
        { header: 'FECHA_VENCIMIENTO', width: 18 },
        { header: 'MONTO_FACTURADO_PESOS', width: 20 }
      ];
      let i = 0;
      listInvoices.forEach((invoice: IInvoice) => {
        sheet.insertRow(i + 2, [
          invoice.id,
          invoice.policy,
          invoice.period,
          invoice.invoiceNumber,
          invoice.invoiceType,
          invoice.companyRut,
          invoice.company,
          invoice.rutsubsidiary,
          invoice.subsidiary,
          invoice.favorOf,
          invoice.debtStatus,
          invoice.gracePeriod,
          invoice.issuanceDate,
          invoice.invoiceDate,
          invoice.expirationDate,
          invoice.invoicedAmount
        ]);
        i++;
      });

      return await workbook.xlsx.writeBuffer();
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async searchPaymentHistory(
    companyRut: string,
    monthRangeDate: number,
    page: number,
    limit: number,
    user: IUserSSO
  ): Promise<IResponseDTO> {
    try {
      const monthQuantity: number = monthRangeDate;
      const today: Date = new Date();
      const monthsAgoDate: Date = moment().subtract(monthQuantity, 'months').toDate();

      const rutInsuranceCO: string = Utils.RUTINSURANCECO;
      let listaPayments: IPaymentHistory[] = [];
      let policiesResponse: IPagedResponse<IPolicy>;
      let policiesList: IPolicy[] = [];
      let pageService = 1;
      let totalPages: number;
      do {
        policiesResponse = await this.policyApi.getPoliciesByCompany(
          Utils.getRutNumber(companyRut),
          Utils.getRutNumber(rutInsuranceCO),
          pageService,
          config.VSQueryLimit,
          user
        );
        policiesList = policiesList.concat(policiesResponse.data);
        totalPages = policiesResponse.totalPage;
        pageService++;
      } while (pageService <= totalPages);

      if (policiesList.length == 0) return returnEmpty(page, limit);

      for (const policy of policiesList) {
        if (policy.hasDebt) {
          const listaPaymentData: IPaymentHistory[] = await this.collectionApi.getPaymentsByPolicy(
            policy.policyNumber,
            monthsAgoDate,
            today,
            user
          );
          if (listaPaymentData) {
            listaPayments = listaPayments.concat(listaPaymentData);
          }
        }
      }
      if (listaPayments.length == 0) return returnEmpty(page, limit);

      const startIndex: number = (page - 1) * limit;
      const endIndex: number = page * limit;
      const recordTotal: number = listaPayments.length;
      const totalPage: number = Math.ceil(recordTotal / limit);

      const result: IPaymentHistory[] = listaPayments.slice(startIndex, endIndex);

      return {
        code: 0,
        message: 'OK',
        data: result,
        page: page,
        limit: limit,
        totalPage: totalPage,
        recordTotal: recordTotal
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async generateExcelPaymentHistory(
    companyRut: string,
    monthRangeDate: number,
    user: IUserSSO
  ): Promise<exceljs.Buffer> {
    try {
      const monthQuantity: number = monthRangeDate;
      const today: Date = new Date();
      const monthsAgoDate: Date = moment().subtract(monthQuantity, 'months').toDate();

      const rutInsuranceCO: string = Utils.RUTINSURANCECO;
      const listaPayments: IPaymentHistory[] = [];
      let policiesResponse: IPagedResponse<IPolicy>;
      let policiesList: IPolicy[] = [];
      let pageService = 1;
      let totalPages: number;
      do {
        policiesResponse = await this.policyApi.getPoliciesByCompany(
          Utils.getRutNumber(companyRut),
          Utils.getRutNumber(rutInsuranceCO),
          pageService,
          config.VSQueryLimit,
          user
        );
        policiesList = policiesList.concat(policiesResponse.data);
        totalPages = policiesResponse.totalPage;
        pageService++;
      } while (pageService <= totalPages);

      for (const policy of policiesList) {
        if (policy.hasDebt) {
          const listaPaymentData: IPaymentHistory[] = await this.collectionApi.getPaymentsByPolicy(
            policy.policyNumber,
            monthsAgoDate,
            today,
            user
          );
          if (listaPaymentData) {
            const policyData: IPolicy = await this.policyApi.getPolicyDetail(policy.policyNumber, user);
            listaPaymentData.forEach((payment: IPaymentHistory) => {
              const colletionGroup: ICollectionGroup = policyData.collectionGroup.find(
                (cg: ICollectionGroup) => cg.code == payment.collectionGroupCode
              );
              payment.subsidiaryRut = colletionGroup ? colletionGroup.rut : '';
              payment.subsidiary = colletionGroup ? colletionGroup.name : '';
              listaPayments.push(payment);
            });
          }
          listaPayments.concat(listaPaymentData);
        }
      }
      if (!listaPayments) {
        this.logger.error('e');
      }

      const workbook: exceljs.Workbook = new exceljs.Workbook();
      workbook.creator = 'VidaSecurity';
      workbook.modified = new Date();
      const sheet: exceljs.Worksheet = workbook.addWorksheet('Pagos');
      sheet.columns = [
        { header: 'NUMERO_AVISO', width: 15 },
        { header: 'NUMERO_COMPROBANTE', width: 15 },
        { header: 'POLIZA', width: 15 },
        { header: 'RUT_FILIAL', width: 20 },
        { header: 'NOMBRE_FILIAL', width: 40 },
        { header: 'PERIODO_COBERTURA', width: 20 },
        { header: 'FECHA_PAGO', width: 20 },
        { header: 'MONTO_PAGADO', width: 20 },
        { header: 'SUCURSAL', width: 20 }
      ];
      for (let i = 0; i < listaPayments.length; i++) {
        sheet.insertRow(i + 2, [
          listaPayments[i].noticeNumber,
          listaPayments[i].voucherNumber,
          listaPayments[i].policy,
          listaPayments[i].subsidiaryRut,
          listaPayments[i].subsidiary,
          listaPayments[i].period,
          listaPayments[i].paymentDate,
          listaPayments[i].amountPay,
          listaPayments[i].branchOffice
        ]);
      }

      return await workbook.xlsx.writeBuffer();
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async getReports(
    input: ICollectionReportInput,
    page: number,
    limit: number,
    user: IUserSSO
  ): Promise<IResponseDTO> {
    this.logger.info('Obteniendo reportes de cobranza - input: ' + JSON.stringify(input));

    const reports: ICollectionReport[] = [];

    for (const policy of input.polices) {
      const invoiceList: IInvoice[] = await this.collectionApi.getInvoicesByPeriod(policy, input.period, user);
      const reportPeriodDetailList: IReportDetail[] = await this.collectionApi.getCollectionReportsByPeriod(
        policy,
        input.period,
        user
      );
      // Array.prototype.push.apply(invoiceList, listResponse);

      let totalMount = 0;
      const invoiceReportDetail: IReportDetail[] = [];
      if (invoiceList && invoiceList.length > 0) {
        invoiceList.forEach((invoice: IInvoice) => {
          const factura: IReportDetail = {
            docType: COLLECTION_DOCUMENT_TYPE.INV,
            fileType: FILE_TYPE.PDF,
            mount: invoice.invoicedAmount,
            name: `Factura-${invoice.invoiceNumber}`,
            token: Number(invoice.invoiceNumber),
            invoiceType: getInvoiceType(invoice.invoiceType)
          };
          invoiceReportDetail.push(factura);
          totalMount = invoice.invoicedAmount + totalMount;
        });
      }
      if (invoiceReportDetail.length > 0 && reportPeriodDetailList.length > 0) {
        reports.push({
          policy: policy,
          totalMount: totalMount,
          invoices: invoiceReportDetail,
          reports: reportPeriodDetailList
        });
      }
    }

    this.logger.info('Reportes encontrados: ' + reports.length);

    const startIndex: number = (page - 1) * limit;
    const endIndex: number = page * limit;
    const recordTotal: number = reports.length;
    const totalPage: number = Math.ceil(recordTotal / limit);

    const result: ICollectionReport[] = reports.slice(startIndex, endIndex);

    return {
      code: result.length > 0 ? 0 : 1,
      message: result.length > 0 ? 'OK' : 'SIN DATOS',
      data: result,
      page: page,
      limit: limit,
      totalPage: totalPage,
      recordTotal: recordTotal
    };
  }

  private groupInvoiceByPolicyAndGroup(listaInvoices: IInvoice[]): ICollection[] {
    let collectionList: ICollection[] = [];
    const map: Map<string, ICollection> = new Map<string, ICollection>();
    listaInvoices.forEach((invoice: IInvoice) => {
      const key: string = invoice.policy + '' + invoice.collectionGroupCode;
      const collectionMap: ICollection = map.get(key);
      if (!collectionMap) {
        const invoiceList: IInvoice[] = [];
        invoiceList.push(invoice);
        const collection: ICollection = {
          policy: invoice.policy,
          rutsubsidiary: '', //TODO mcadiz
          subsidiary: invoice.collectionGroupName, //TODO mcadiz
          amountExpiredDebt: invoice.debtStatus == INVOICE_DEBT_STATUS.EXPIRED ? invoice.invoicedAmount : 0, //revisar
          amountOngoingDebt: invoice.debtStatus != INVOICE_DEBT_STATUS.EXPIRED ? invoice.invoicedAmount : 0,
          status: invoice.debtStatus == INVOICE_DEBT_STATUS.EXPIRED ? DEBT_STATUS.EXPIRED : DEBT_STATUS.ON_GOING,
          invoices: invoiceList
        };
        map.set(key, collection);
      } else {
        collectionMap.invoices.push(invoice);
        collectionMap.amountExpiredDebt =
          collectionMap.amountExpiredDebt +
          (invoice.debtStatus == INVOICE_DEBT_STATUS.EXPIRED ? invoice.invoicedAmount : 0);
        collectionMap.amountOngoingDebt =
          collectionMap.amountOngoingDebt +
          (invoice.debtStatus != INVOICE_DEBT_STATUS.EXPIRED ? invoice.invoicedAmount : 0);
        if (invoice.debtStatus == INVOICE_DEBT_STATUS.EXPIRED) {
          collectionMap.status = DEBT_STATUS.EXPIRED;
        }
        collectionMap.status;
      }
    });

    if (map.size > 0) {
      collectionList = Array.from(map.values());
    }
    return collectionList;
  }
}
