import { COLLECTION_DOCUMENT_TYPE, FILE_TYPE } from '../../../../constants/types';
import { InvoiceType } from '../v3/ICollection';

export interface ICollectionReportInput {
  period: string;
  polices: number[];
}

export interface ICollectionReport {
  policy: number;
  totalMount: number;
  invoices: IReportDetail[];
  reports: IReportDetail[];
}

export interface IReportDetail {
  token: number;
  name: string;
  docType: COLLECTION_DOCUMENT_TYPE;
  mount?: number;
  fileType: FILE_TYPE;
  invoiceType?: InvoiceType;
}
