export interface IDeductibleDTO {
  concept: string;
  individualAccumulatedRefund: number;
  familyAccumulatedRefund: number;
  individualPreviousDeductible: number;
  familyPreviousDeductible: number;
  individualAccumulatedDeductible: number;
  familyAccumulatedDeductible: number;
  individualAnnualDeductible: number;
  familyAnnualDeductible: number;
  annualCap: number;
}
