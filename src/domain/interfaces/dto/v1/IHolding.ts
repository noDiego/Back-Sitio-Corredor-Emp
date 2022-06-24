import { IContractor } from '../v3/IContractor';

export interface IHoldingDTO {
  code: string;
  name: string;
  totalContractors: number;
  contractors: Array<IContractor>;
}
