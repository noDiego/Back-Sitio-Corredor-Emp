import { IPolicy } from './IPolicy';

export interface ICollectionGroup {
  idGroup: number;
  code: number;
  rut: string;
  name: string;
  benefitStatus: string;
  debtStatus: string;
  currentDebtAmount: number;
  expiredDebtAmount: number;
}

export interface ICollection {
  // Cobranza
  policy: number;
  rutsubsidiary: string;
  subsidiary: string;
  amountExpiredDebt: number;
  amountOngoingDebt: number;
  status: string;
  invoices: IInvoice[];
  policyData?: IPolicy;
}

export interface IInvoice {
  policy: number;
  id: number;
  invoiceNumber: number;
  invoiceType: string;
  companyRut: string;
  company: string;
  favorOf: string;
  debtStatus: string;
  gracePeriod: number;
  issuanceDate: Date;
  invoiceDate: Date;
  expirationDate: Date;
  invoicedAmount: number;
  collectionGroupCode: number;
  collectionGroupName: string;
  invoiceCompanyRut: string;
  invoiceCompany: string;
  rutsubsidiary: string;
  subsidiary: string;
  period: number;
  fileId: string;
}

export interface IPaymentHistory {
  contractRut: string;
  noticeNumber: string;
  voucherNumber: number;
  branchOffice: string;
  period: number;
  subsidiary: string;
  subsidiaryRut: string;
  policy: number;
  paymentDate: Date;
  amountPay: number;
  collectionGroupCode: number;
  collectionGroupName: string;
}

export enum InvoiceType {
  AFECTA = 33,
  EXENTA = 34
}

export function getInvoiceType(typeString: string): InvoiceType {
  switch (typeString) {
    case 'EXENTA':
      return InvoiceType.EXENTA;
    case 'AFECTA':
      return InvoiceType.AFECTA;
  }
}
