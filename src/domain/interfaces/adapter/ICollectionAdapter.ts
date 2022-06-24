import { IUserSSO } from '../dto/v3/IUserSSO';
import { IInvoice, InvoiceType } from '../dto/v3/ICollection';
import { IReportDetail } from '../dto/v1/ICollectionReport';

export interface ICollectionAdapter {
  getDebtInvoicesByPolicy(policyNumber: number, userSSO: IUserSSO): Promise<IInvoice[]>;
  getInvoicesByPeriod(policyNumber: number, period: string, userSSO: IUserSSO): Promise<IInvoice[]>;
  getCollectionReportsByPeriod(policyNumber: number, period: string, userSSO: IUserSSO): Promise<IReportDetail[]>;
  getInvoicePDF(invoice: number, type: InvoiceType, rutCo: number, userSSO: IUserSSO): Promise<Buffer>;
}
