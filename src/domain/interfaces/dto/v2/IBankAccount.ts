import { IValueObjectV1 } from '../v1/IValueObject';

export interface IBankAccountDTO {
  bank: IValueObjectV1;
  accountType: IValueObjectV1;
  number: number;
}
