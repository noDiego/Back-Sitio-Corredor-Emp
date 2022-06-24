export interface IBenefitDTO {
  code?: string;
  name?: string;
  sinisterDate?: Date;
  incurredExpense: number;
  isapreContribution: number;
  chargedAmount: number;
  bmiAmount: number;
  coveragePercent?: number;
  base: number;
  deductible: number;
  refund: number;
}
