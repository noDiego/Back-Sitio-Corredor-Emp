import { IValueObjectV1 } from './IValueObject';
import { IBenefitDTO } from './IBenefit';
import { IDeductibleDTO } from './IDeductible';
import { IPaymentV1 } from './IPayment';

export interface IDenounceDTO {
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
  insured: IValueObjectV1;
  beneficiary: IValueObjectV1;
  status: string;
  denounceUser: string;
  broker: IValueObjectV1;
  company: IValueObjectV1;
  amountClaim: number;
  amountPay: number;
  benefits?: Array<IBenefitDTO>;
  totalBenefits?: IBenefitDTO;
  deductibles?: Array<IDeductibleDTO>;
  payment?: IPaymentV1;
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
