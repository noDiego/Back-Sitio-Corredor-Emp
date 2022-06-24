import { ILegalPerson } from './ILegalPerson';

export interface IDenounce {
  consignment: string;
  applicationNumber: number;
  policy: number;
  plan: string;
  startDateContract: Date;
  endDateContract: Date;
  firstTerm: Date;
  changeFactor: number;
  denounceDate: Date;
  liquidationDate: Date;
  insured: ILegalPerson;
  beneficiary: ILegalPerson;
  status: string;
  denounceUser: string;
  broker: ILegalPerson;
  company: ILegalPerson;
  amountClaim: number;
  amountPay: number;
  observation?: string;
}

export interface IDenounceSearchRequestDTO {
  consignment?: string;
  applicationNumber?: number;
  policy?: number;
  insuredRut?: string;
  contractorRut?: string;
  codeDate?: number;
  status?: string;
  onlyMine?: boolean;
  page?: number;
  limit?: number;
}

export interface IDenounceFileRouteDTO {
  id: number;
  name: string;
  route: string;
}

export interface IDenounceDetail {
  denounce: IDenounce;
  paymentType: IPaymentType;
  benefits: IBenefit[];
  deductibles: IDeductible[];
}

export interface IPaymentType {
  uf: number;
  type: string;
  bankName: string;
  bankAccount: string;
  costCenter: string;
}
export interface IDeductible {
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

export interface IBenefit {
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
  deductibles?: IDeductible[]; //TODO: Revisar, esta dos veces en el Detail?
}

export interface IDenounceServiceInput {
  rutInsuranceCo: number;
  startDate: Date;
  endDate: Date;
  insuredRut?: number;
  status?: string;
  userRut?: string;
  page?: number;
  limit?: number;
  policyNumber?: number;
  companyRut?: number;
  brokerRut?: number;
}
