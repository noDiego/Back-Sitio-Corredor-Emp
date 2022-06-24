import { CONTRACTOR_STATUS } from '../../../../constants/status';
import { IPolicy } from './IPolicy';
import { IValueObjectV1 } from '../v1/IValueObject';
import { IPolicyV2 } from '../v2/IPolicy';

export interface IContractor {
  rut: string;
  name: string;
  holding?: IValueObjectV1;
  address?: string;
  bussinessLine?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  totalPolicies?: number;
  policiesList?: Array<IPolicy | IPolicyV2>;
  status?: CONTRACTOR_STATUS;
  hasPendingRequirements?: boolean;
}

export interface IContractorsSummary {
  blockedAmount: number;
  pendingReqAmount: number;
  totalContractors: number;
}

export interface IContractorsResponse {
  summary: IContractorsSummary;
  contractors: IContractor[];
}
