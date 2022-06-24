import { IPlanV2 } from './IPlan';
import { IValueObjectV1 } from '../v1/IValueObject';
import { IInsuredV2 } from './IInsured';
import { IContractor } from '../v3/IContractor';
import { IBroker } from '../v3/IPolicy';
import { ISubsidiary } from '../v3/ISubsidiary';
import { IProduct } from '../v3/IPlan';

export interface IPolicyV2 {
  number: number;
  insuranceCoRut?: string;
  company: IContractor;
  contractor: IContractor;
  holding: IValueObjectV1;
  broker?: IBroker;
  business?: IContractor;
  status: string;
  startDate: Date;
  endDate: Date;
  firstTerm: Date;
  renovation: number;
  productoDescription: string[];
  products?: Array<IProduct>;

  incumbentQuantity?: number;
  dependentQuantity?: number;
  subsidiaries?: Array<ISubsidiary>; //filiales
  plans?: Array<IPlanV2>;
  insured?: Array<IInsuredV2>;
  isBlocked?: boolean;
  hasPendingRequirements?: boolean;
}
