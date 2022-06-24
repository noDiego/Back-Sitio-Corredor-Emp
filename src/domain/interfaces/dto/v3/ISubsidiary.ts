import { ICollectionGroup } from './ICollection';

export interface ISubsidiary {
  code: number;
  rut: string;
  name: string;
  groupQuantity?: number;
  collectionQuantity?: number;
  collectionGroup?: ICollectionGroup; //Grupo Asegurado
}

export interface ISubsidiaryChangeInput {
  insuredRut: number;
  subsidiary: number;
  policyNumber: number;
  insuredGroup: number;
  startDate: Date;
  capital: number;
  rent: number;
}
