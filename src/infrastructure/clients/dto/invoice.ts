export interface InvoiceResponse {
  bill: Invoice[];
}

export interface Invoice {
  policyNumber: string;
  coveragePeriod: number;
  billId: number;
  invoice: number;
  noticeNumber: string;
  billType: string;
  billRut: string;
  socialReason: string;
  inFavorOf: string;
  paymentStatus: string;
  debtStatus: string;
  periodOfGrace: number;
  collectionIssueDate: Date;
  invoiceDate: Date;
  expirationDate: Date;
  billedAmount: number;
  ivaAmount: number;
  collectionGroup: CollectionGroup;
}

export interface CollectionGroup {
  id: number;
  code: number;
  nameGroup: string;
}
