export interface PaymentResponse {
  payment: Payment[];
}

export interface Payment {
  policyNumber: number;
  notificationNumber: string;
  paymentDate: Date;
  amount: number;
  branch: number;
  channel: string;
  voucher: number;
  rutInvoice: string;
  invoiceName: string;
  coveragePeriod: number;
  collectionGroup: CollectionGroup;
}

export interface CollectionGroup {
  id: number;
  code: number;
  nameGroup: string;
}
