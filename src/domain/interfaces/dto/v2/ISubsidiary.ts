import { IGroupDTO } from './IGroup';

export interface ISubsidiaryV2 {
  code: string;
  rut: string;
  name: string;
  groupQuantity?: number;
  collectionQuantity?: number;
  groups?: Array<IGroupDTO>; //Grupo Asegurado
}
