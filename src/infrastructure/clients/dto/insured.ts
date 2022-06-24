import { Plan, Product } from './plan';

interface Insured {
  renewalId: number;
  policyNumber: number;
  code: number;
  rut: number;
  dv: string;
  firstName: string;
  activeDependents?: string;
  lastName: string;
  birthDate: Date;
  civilStatus: CivilStatus;
  gender: Gender;
  insuredGroup: InsuredGroup;
  subsidiary: Subsidiary;
  plan: Plan;
  originalStartDate: Date;
  startDate: Date;
  endDate: Date;
  capital: number;
  rent: number;
}

export interface InsuredDetail extends Insured {
  accountBank: AccountBank;
  contactInfo: ContactInfo;
  isapre: Isapre;
  familyGroup: FamilyGroup;
  beneficiaryVersion: BeneficiaryVersion;
}
export interface InsuredShort extends Insured {
  products?: Product[];
}

export interface CivilStatus {
  code: number;
  name: string;
}

export interface Gender {
  code: string;
  name: string;
}

export interface InsuredGroup {
  idGroup: number;
  code: number;
  name: string;
  startDate?: Date;
  endDate?: Date;
  planCode?: number;
  subsidiaryCode?: number;
  collectiongGroupCode?: number;
}

export interface Subsidiary {
  code: number;
  rut: number;
  dv: string;
  name: string;
}

export interface Bank {
  bankCode: number;
  bankName: string;
}

export interface AccountType {
  accountCode: number;
  accountName: string;
}

export interface AccountBank {
  bank: Bank;
  accountType: AccountType;
  accountNumber: string;
}

export interface Commune {
  communeCode: number;
  communeName: string;
}

export interface City {
  cityCode: number;
  cityName: string;
}

export interface Region {
  regionCode: number;
  regionName: string;
}

export interface ContactInfo {
  address: string;
  commune: Commune;
  city: City;
  region: Region;
  emailAddress: string;
  phoneNumber: string;
  cellPhone: string;
}

export interface Isapre {
  code: string;
  name: string;
}

export interface Relationship {
  code: string;
  name: string;
}

export interface Gender2 {
  code: string;
  name: string;
}

export interface Dependent {
  id: number;
  rut: number;
  dv: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  relationship: Relationship;
  gender: Gender2;
  originalStartDate: Date;
  startDate: Date;
  endDate: Date;
}

export interface FamilyGroup {
  dependent: Dependent[];
}

export interface Relationship2 {
  code: string;
  name: string;
}

export interface Beneficiary {
  rut: number;
  dv: string;
  name: string;
  relationship: Relationship2;
  startDate: Date;
  endDate: Date;
  percentage: string;
}

export interface Version {
  versionCode?: number;
  versionNumber?: number;
  beneficiaries: Beneficiary[];
}

export interface BeneficiaryVersion {
  version: Version[];
}

export interface ContactInfoUpdate {
  rut: number;
  dv: string;
  bankCode: number;
  bankType: number;
  accountNumber: string;
  address: string;
  commune: number;
  emailAddress: string;
  phoneNumber: string;
  cellPhone: string;
  isapre: string;
  user: string;
}

export interface PostResponse {
  isSuccess: boolean;
  value: string;
}

export interface InsuredDeductibleResponse {
  deductibles: InsuredDeductible[];
}

export interface InsuredDeductible {
  beneficiary: BeneficiaryDeductibles;
  rutTitular: number;
  accumulatedSalud: number;
  accumulatedSaludDental: number;
}

export interface BeneficiaryDeductibles {
  correlative: number;
  rut: number;
  dv: string;
  name: string;
  relacion: string;
}

export interface InsuredVirtualSubscription {
  policyNumber: number;
  rut: number;
  dv: string;
  email: string;
  insuredGroup: string;
  contractDate: Date;
  startValidityDate: Date;
  capital: number;
  rent: number;
}

export interface VirtualSubscription {
  status: number;
  message: string;
  underwritingCode: number;
}

export interface VirtualSubscriptionResponse {
  subscriptionCode: number;
  underWritings: VirtualSubscription[];
}
