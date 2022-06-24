import { Pagination } from './pagination';

export interface Policy {
  renewalId: number;
  policyNumber: number;
}

export interface Insurance {
  id: number;
  rut: number;
  dv: string;
  name: string;
  capital: number;
}

export interface Requirement {
  type: string;
  name: string;
  status: string;
  receptionDate: Date;
  observacion: string;
}

export interface InsuranceRequirement {
  idRequirement: number;
  policy: Policy;
  insurance: Insurance;
  requirementDate: Date;
  requirementType: string;
  tokenNote: string;
  requirement: Requirement[];
}

export interface InsuranceReqResponse {
  insuranceRequirement: InsuranceRequirement[];
  pagination: Pagination;
}
