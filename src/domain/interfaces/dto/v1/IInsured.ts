import { IPlanV1 } from './IPlan';
import { IPolicyV1 } from './IPolicy';
import { IBeneficiaryDTO } from './IBeneficiary';
import { IPolicyAccess } from '../v3/IInsured';

export interface IInsuredDTO {
  rut: string;
  firstName: string;
  lastName: string;
  birthday: Date;
  maritalStatus?: string;
  codeBank?: string;
  bankName: string;
  codeAccountType?: string;
  bankAccountType: string;
  bankAccountNumber: string;
  address: string;
  codeComuna?: string;
  commune: string;
  codeCiudad?: string;
  city?: string;
  codeRegion?: string;
  region: string;
  email: string;
  phone: string;
  cellphone: string;
  tipoAfiliacion?: string;
  isapreCode?: string;
  isapre?: string;
  policy?: IPolicyV1;
  plan?: IPlanInsuredFileDTO;
  plans?: Array<IPlanV1>;
  beneficiaries?: Array<IBeneficiaryDTO>;
  policies?: IPolicyAccess[];
}

export interface InsuredDeductibleDataDTO {
  deductibles: InsuredDeductibleDTO[];
  totalDental: number;
  totalHealth: number;
}

export interface InsuredDeductibleDTO {
  beneficiaryName: string;
  beneficiaryRut: string;
  dentalAmount: number;
  healthAmount: number;
}

export interface IPlanInsuredFileDTO {
  code: number;
  name: string;
}
