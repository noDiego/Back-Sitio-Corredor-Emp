import { IInsuredGroup } from './IInsuredGroup';
import { IPlan, IProduct } from './IPlan';
import { ISubsidiary } from './ISubsidiary';
import { ICodeObject } from './ICodeObject';
import { IPolicy } from './IPolicy';

export interface IInsured {
  renewalId: number;
  policyNumber: number;
  code: number;
  rut: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  civilStatus: ICodeObject;
  gender: ICodeObject;
  insuredGroup: IInsuredGroup;
  subsidiary: ISubsidiary;
  plan: IPlan;
  originalStartDate: Date;
  startDate: Date;
  endDate: Date;
  capital: number;
  rent: number;
  products?: IProduct[]; //En listado pero no en detalle
  accountBank?: IAccountBank;
  contactInfo?: IContactInfo;
  isapre?: ICodeObject;
  familyGroup?: IFamilyGroup;
  beneficiaryVersion?: IBeneficiaryVersion;
  policies?: IPolicy[];
  policiesNumberList?: IPolicyAccess[];
  activeDependents?: string;
}

export interface IAccountBank {
  bank: ICodeObject;
  accountType: ICodeObject;
  accountNumber: string;
}

export interface IContactInfo {
  address: string;
  commune: ICodeObject;
  city: ICodeObject;
  region: ICodeObject;
  emailAddress: string;
  phoneNumber: string;
  cellPhone: string;
}

export interface IDependent {
  id: number;
  rut: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  relationship: ICodeObject;
  gender: ICodeObject;
  originalStartDate: Date;
  startDate: Date;
  endDate: Date;
}

export interface IFamilyGroup {
  dependent: IDependent[];
}

export interface IBeneficiary {
  rut: string;
  name: string;
  relationship: ICodeObject;
  startDate: Date;
  endDate: Date;
  percentage: string;
}

export interface IVersion {
  versionCode: number;
  beneficiaries: IBeneficiary[];
}

export interface IBeneficiaryVersion {
  version: IVersion[];
}

export interface InsuredEdition {
  allPolicies: string;
  policyNumber: string;
  rut: string;
  birthday: Date;
  maritalStatus?: string;
  address?: string;
  codeRegion?: string;
  codeCiudad?: string;
  codeComuna?: string;
  phone?: string;
  cellphone?: string;
  email?: string;
  codeBank?: string;
  codeAccountType?: string;
  accountNumber?: string;
  codePrevision?: string;
}

export interface InsuredDeductible {
  beneficiaryName: string;
  beneficiaryRut: string;
  dentalAmount: number;
  healthAmount: number;
}
export interface IPolicyAccess {
  policyNumber: number;
  hasAccess: boolean;
}
