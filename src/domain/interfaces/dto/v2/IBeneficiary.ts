export interface IBeneficiary {
  rut: number;
  dv: string;
  name: string;
  relationship?: IRelationship;
  startDate?: Date;
  endDate?: Date;
  percentage?: string;
}

export interface IRelationship {
  code: string;
  name: string;
}
