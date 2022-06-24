import { Broker, Contractor } from './policy';
import { Pagination } from './pagination';

export interface ClaimsReponse {
  claims: Claim[];
}

export interface Claim {
  remittanceId: string;
  requestNumber: number;
  requestStatus: string;
  claimsStatus: string;
  companyRut: number;
  broker: Broker;
  contractor: Contractor;
  policy: Policy;
  plan: Plan;
  startValidityDate: Date;
  endValidityDate: Date;
  issueDate: Date;
  settlementDate: Date;
  paymentDate: Date;
  insured: Insured;
  beneficiary: Beneficiary;
  claimUser: string;
  claimChannel: string;
  claimedAmount: number;
  paidAmount: number;
  comments: string;
  pagination: Pagination;
}

export interface Policy {
  renewalIdtrassa: number;
  policyNumber: number;
}

export interface ClaimType {
  code: string;
  name: string;
}

export interface Plan {
  code: number;
  name: string;
  claimType: ClaimType;
}

export interface Insured {
  rut: number;
  dv: string;
  name: string;
}

export interface Beneficiary {
  correlative: number;
  rut: number;
  dv: string;
  name: string;
  relacion: string;
}
