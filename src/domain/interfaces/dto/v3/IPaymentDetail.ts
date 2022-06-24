import { ICodeObject } from './ICodeObject';

export interface IPaymentTypeDetail {
  codigo: number;
  destinatario: string;
  cuenta: string;
  bank: ICodeObject;
  bankTypeAccount: ICodeObject;
}
