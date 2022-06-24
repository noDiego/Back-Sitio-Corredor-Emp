export interface IInsuredGroup {
  idGroup: number;
  code: number;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  planCode?: number;
  subsidiaryCode?: number;
  collectiongGroupCode?: number;
}

export interface IInsuredGroupChangeInput {
  insuredRut: number;
  insuredDV: string;
  policyNumber: number;
  insuredGroup: number;
  startDate: Date;
  capital: number;
  rent: number;
}
