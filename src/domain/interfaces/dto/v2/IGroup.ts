import { IValueObjectV1 } from '../v1/IValueObject';

export interface IGroupDTO {
  code: string;
  name: string;
  planName?: IValueObjectV1;
  startDate?: Date;
  endDate?: Date;
}
