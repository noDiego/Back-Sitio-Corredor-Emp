import { ISubsidiary } from './ISubsidiary';
import { IPlan, IProduct } from './IPlan';
import { IContractor } from './IContractor';
import { IInsured } from './IInsured';
import { ICollectionGroup } from './ICollection';
import { IInsuredGroup } from './IInsuredGroup';

export interface IPolicy {
  renewalId: number;
  renewal: number;
  policyNumber: number;
  insuranceCoRut: string;
  company: ICompany;
  holding: IHolding;
  contractor: IContractor;
  broker: IBroker;
  status: string;
  firstTerm: Date;
  startDate: Date;
  endDate: Date;
  productDescription: string[];
  numberOfHolders: number;
  numberOfBeneficiaries: number;

  hasBlockedBenefits: boolean;
  hasPendingRequirements: boolean;
  hasDebt: boolean;
  hasHealthBenefits: boolean;

  insuredList: Array<IInsured>;

  products?: Array<IProduct>;
  plans?: Array<IPlan>;
  subsidiaries?: Array<ISubsidiary>; //filiales
  insuredGroup?: Array<IInsuredGroup>;
  collectionGroup?: Array<ICollectionGroup>;
}

export interface ICompany {
  rut: string;
  name: string;
  businessActivity: string;
}

export interface IHolding {
  number: number;
  name: string;
}

export interface IBroker {
  rut: string;
  name: string;
}
