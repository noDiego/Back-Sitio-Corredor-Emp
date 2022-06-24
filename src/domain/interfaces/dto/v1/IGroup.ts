import { IValueObjectV1 } from './IValueObject';

export interface IGroupV1 {
  code: string;
  name: string;
  planName: string;
  startDate: Date;
  endDate: Date;
  collection?: IValueObjectV1;
}
