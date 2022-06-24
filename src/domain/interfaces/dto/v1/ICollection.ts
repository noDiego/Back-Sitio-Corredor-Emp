export interface ICollectionDTO {
  // Cobranza
  policy: number;
  rutsubsidiary: string;
  subsidiary: string;
  amountExpiredDebt: number;
  amountOngoingDebt: number;
  status: string;
  invoices: IInvoiceDTO[];
}

export interface IInvoiceDTO {
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
  collectionGroup: number;
  invoiceCompanyRut: string;
  invoiceCompany: string;
  period: number;
  fileId: string;
}

export interface IGroupCollectionDTO {
  policy: number;
  npzgcCdg: number;
  groupCollectionCode: number;
  groupCollection: string;
  rut: number;
  dv: string;
  company: string;
  ongoingDebt: number;
  pendingDebt: number;
  debtStatus: string;
  profitStatus: string;
}
