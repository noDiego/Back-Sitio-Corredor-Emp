import { Plan, Product } from './plan';
import { InsuredGroup, Subsidiary } from './insured';

interface Policy {
  renewal: number;
  renewalId: number;
  policyNumber: number;
  insuranceCoRut: number;
  insuranceCoDv: string;
  tradeGroup: TradeGroup;
  contractor: Contractor;
  company: Company;
  broker: Broker;
  status: string;
  firstTerm: Date;
  startDate: Date;
  endDate: Date;
  productDescription: string;
  numberOfHolders: number;
  numberOfBeneficiaries: number;
  hasBlockedBenefits: string;
  hasDebt: string;
  hasHealthBenefits: string;
  hasPendingRequirements: string;
}

export interface PolicyDetail extends Policy {
  subsidiaries: Subsidiary[];
  products: Product[];
  plans?: Plan[];
  insuredGroup?: InsuredGroup[];
  collectionGroup?: CollectionGroup[];
}

export type PolicyShort = Policy;

export interface TradeGroup {
  number: number;
  name: string;
}

export interface Contractor {
  rut: number;
  dv: string;
  name: string;
}

export interface Company {
  rut: number;
  dv: string;
  name: string;
  businessActivity: string;
}

export interface Broker {
  rut: number;
  dv: string;
  name: string;
}

export interface CollectionGroup {
  idGroup: number;
  code: number;
  rut: number;
  dv: string;
  name: string;
  benefitStatus: string;
  debtStatus: string;
  currentDebtAmount: number;
  expiredDebtAmount: number;
}
