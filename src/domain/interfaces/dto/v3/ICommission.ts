import { ICodeObject } from './ICodeObject';

export interface ICommissionType {
  code: string;
  name: string;
  total: number;
}

export interface ICommissionTypeRes {
  commissionType: ICommissionType[];
  totalAmount: number;
}

export interface IPeriod {
  code: string;
  value: string;
}

export interface ICommissionPeriodsRes {
  periods: IPeriod[];
}

export interface IPeriodYear {
  code: string;
  name: string;
  months: ICodeObject[];
}

export interface Intermediary {
  code: string;
  name: string;
  type: string;
}

export interface TypeConceptTotals {
  net: CommissionTotals;
  iva: CommissionTotals;
  total: CommissionTotals;
}

export interface CommissionTotals {
  total: number;
  exempt?: number;
  affect?: number;
  natural?: number;
}

export interface TotalPeriodType {
  codeType: string;
  description: string;
  totalAmount: number;
}

export interface ICommissionTotals {
  commissions: TotalPeriodType[];
  bonds: TotalPeriodType[];
  total: TypeConceptTotals;
}

export enum CommissionTotalType {
  COMISION = 'Commission',
  BONO = 'Bond'
}