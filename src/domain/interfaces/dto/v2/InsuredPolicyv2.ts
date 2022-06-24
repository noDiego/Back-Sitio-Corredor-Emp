export interface InsuredDetail {
  insured: Insured;
  contactInfo: ContactInfo;
  isapre: Isapre;
  familyGroup: FamilyGroup;
  beneficiaries: Beneficiaries;
}

export interface InsuredGroup {
  code: string;
  name: string;
}

export interface Subsidiaries {
  code: number;
  rut: string;
  dv?: string;
  name: string;
}

export interface Coverage {
  code: string;
  coverageName: string;
  tokenBenefits: string;
  capital: string;
  limit: string;
  premium: string;
}

export interface Product {
  code: string;
  name: string;
  certified: string;
  coverages: Coverage[];
}

export interface Plan {
  code: string;
  name: string;
  products: Product[];
}

export interface Bank {
  bankCode: string;
  bankName: string;
}

export interface AccounType {
  accountCode: string;
  accountName: string;
}

export interface AccountBank {
  bank: Bank;
  accounType: AccounType;
  accountNumber: string;
}

export interface Insured {
  policyNumber: string;
  rut: string;
  firstName: string;
  lastName: string;
  birthday: Date;
  civilStatus: string;
  insuredGroup: InsuredGroup;
  subsidiaries: Subsidiaries;
  plan: Plan;
  startDate: Date;
  endDate: Date;
  accountBank: AccountBank;
}

export interface Commune {
  code: string;
  name: string;
}

export interface City {
  code: string;
  name: string;
}

export interface Region {
  code: string;
  name: string;
}

export interface ContactInfo {
  address: string;
  commune?: Commune;
  city?: City;
  region?: Region;
  emailAddress: string;
  phoneNumber: string;
  cellPhone: string;
}

export interface Isapre {
  code: string;
  name: string;
}

export interface FamilyGroup {
  rut: string;
  name: string;
  relationship: string;
  startDate: Date;
  endDate: Date;
}

export interface Beneficiaries {
  version: string;
  rut: string;
  name: string;
  relationship: string;
  startDate: Date;
  endDate: Date;
  percentage: string;
}
