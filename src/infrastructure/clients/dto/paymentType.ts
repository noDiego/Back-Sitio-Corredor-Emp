export interface Bank {
  code: number;
  name: string;
}

export interface BankTypeAccount {
  code: number;
  name: string;
}

export interface PaymentTypeDetail {
  codigo: number;
  destinatario: string;
  cuenta: string;
  bank: Bank;
  bankTypeAccount: BankTypeAccount;
}

export interface PaymentTypeResponse {
  paymentTypeDetails: PaymentTypeDetail[];
}
