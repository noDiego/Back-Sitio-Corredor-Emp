import { Claim } from './claims';

export interface PaymentType {
  uf: number;
  type: string;
  bankName: string;
  bankAccount: string;
  costCenter: string;
}

export interface Deductible {
  concept: string;
  individualAccRefund: string;
  familyAccRefund: string;
  individalPrevDeductible: string;
  familyPrevDeductible: string;
  individualAccDeductible: string;
  familyAccDeductible: string;
  individualAnnualDeductible: string;
  familyAnnualDeductible: string;
  annualLimit: string;
}

export interface Benefit {
  name: string;
  claimDate: Date;
  totalExpenses: number;
  isapreContribution: number;
  changesAmount: number;
  bmiAmount: number;
  coveragePercentage: number;
  base: number;
  deductible: number;
  refund: number;
  code: number;
  deductibles?: Deductible[]; //TODO: Revisar, esta dos veces en el Detail?
}

export interface ClaimsDetail {
  claims: Claim;
  paymentType: PaymentType;
  benefits: Benefit[];
  deductiblesDetails: Deductible[];
}

export interface ClaimsDetailResponse {
  claimsDetail: ClaimsDetail[];
}
