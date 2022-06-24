import { IValueObjectV1 } from '../v1/IValueObject';

export interface IContactDataDTO {
  address: string;
  comuna: IValueObjectV1;
  city: IValueObjectV1;
  region: IValueObjectV1;
  email: string;
  phone: string;
  cellphone: string;
}
