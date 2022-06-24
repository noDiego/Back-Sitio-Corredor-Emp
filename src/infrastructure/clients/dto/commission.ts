export interface CommissionType {
  code: string;
  name: string;
  total: number;
}

export interface CommissionTypeRes {
  commissionType: CommissionType[];
  totalAmount: number;
}

export interface Period {
  code: string;
  value: string;
}

export interface CommissionPeriodsRes {
  periods: Period[];
}

export interface IntermediaryRes {
  intermediaries: Intermediary[];
}

export interface Intermediary {
  code: string;
  name: string;
  type: string;
}

export interface TotalsDetail {
  coverageType: string;
  conceptType: string;
  amount: number;
}

export interface TotalPeriodDetail {
  concept: string;
  conceptName: string;
  totalDescription: string;
  totalAmount: number;
  TotalsDetails: TotalsDetail[];
}

export interface TotalsResp {
  totalPeriodDetails: TotalPeriodDetail[];
}
