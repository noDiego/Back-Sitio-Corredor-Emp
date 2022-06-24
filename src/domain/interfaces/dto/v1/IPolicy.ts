import { ISubsidiaryV1 } from './ISubsidiary';
import { IPlanV1 } from './IPlan';
import { IInsuredPolicyV1 } from './IInsuredPolicy';
import { ISummaryPolicyV1 } from './ISummaryPolicy';
import { IProductV1 } from './IProduct';
import { IBroker, ICompany } from '../v3/IPolicy';
import { IContractor } from '../v3/IContractor';

export interface IPolicyV1 {
  number: number;
  contractor: IContractor;
  status: string;
  startDate: Date;
  endDate: Date;
  firstTerm: Date;
  renovation: number;
  incumbentQuantity: number;
  dependentQuantity: number;

  subsidiaries?: Array<ISubsidiaryV1>;
  plans?: Array<IPlanV1>;

  insured?: Array<IInsuredPolicyV1>;
  summary?: ISummaryPolicyV1;
  products?: Array<IProductV1>;

  renewalId?: number;
  insuranceCoRut?: string;
  company?: ICompany;
  broker?: IBroker;
}
