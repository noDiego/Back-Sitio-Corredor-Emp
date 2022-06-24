import { IProductV2 } from './IProduct';

export interface IPlanV2 {
  code: number;
  name: string;
  startDate: Date;
  endDate: Date;
  products?: Array<IProductV2>;
  capitalRequired: boolean;
  incomeRequired: boolean;
}
