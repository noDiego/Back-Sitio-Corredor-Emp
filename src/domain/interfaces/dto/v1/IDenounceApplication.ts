import { IPaymentV1 } from './IPayment';
import { IValueObjectV1 } from './IValueObject';

export interface IDenounceApplicationDTO {
  id?: number;
  consignment?: string;
  applicationNumber?: number;
  policy?: number;
  renovation?: number;
  insuredRut: string;
  insuredName: string;
  insuredEmail: string;
  insuredLastname: string;
  denounceType?: string;
  denounceTypeCode?: string;
  beneficiaryRut?: string;
  beneficiaryName?: string;
  userRut: string;
  userName: string;
  userEmail: string;
  plan?: string;
  planCode?: string;
  amount?: number;
  comment?: string;
  creationDate?: Date;
  groupCode?: string;
  status: string;
  paymentId?: number;
  denounceForm?: IDenounceAppForm[];
  denounceFiles?: Array<string>;
}

export interface IDenounceAppForm {
  denounceTypeCode: string;
  denounceType: string;
  beneficiaries: Array<IDenounceAppBeneficiaryDTO>;
}

export interface IDenounceAppBeneficiaryDTO {
  dependentRut: string;
  dependentName: string;
  plans: Array<IDenounceAppPolicyDTO>;
}

export interface IDenounceAppPolicyDTO {
  policyCode: string;
  policyNumber: string;
  planCode: string;
  planName: string;
}

export interface IDenouncePolicyDataV1 {
  insureds: Array<IValueObjectV1>;
  companyPaymentMode: boolean;
  accountList?: Array<IPaymentV1>;
  cashiercheckList?: Array<IPaymentV1>;
}
