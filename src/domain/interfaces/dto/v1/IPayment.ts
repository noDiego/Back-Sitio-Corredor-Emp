export interface IPaymentV1 {
  id: number;
  deposit: number;
  accountNumber: string;
  accountType: string;
  bank: string;
  costCenter?: string;
  paymentMethod: string;
  namedAtCashierCheck?: string;
}

export interface IPaymentHistoryDTO {
  contractRut: string;
  noticeNumber: number;
  voucherNumber: number;
  branchOffice: string;
  period: number;
  subsidiary: string;
  subsidiaryRut: string;
  policy: number;
  paymentDate: Date;
  amountPay: number;
}
