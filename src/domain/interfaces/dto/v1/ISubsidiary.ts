import { IGroupV1 } from './IGroup';

export interface ISubsidiaryV1 {
  code?: number;
  rut: string;
  name: string;
  startDate?: Date;
  endDate?: Date;
  groupQuantity?: number;
  collectionQuantity?: number;
  groups?: Array<IGroupV1>;
}
