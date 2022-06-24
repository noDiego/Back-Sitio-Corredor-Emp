import { PAYROLL_TYPE } from '../../../../constants/types';
import { Worksheet } from 'exceljs';
import { IPolicy } from '../v3/IPolicy';
import { IValueObjectV1 } from './IValueObject';

export interface IPayrollDTO {
  id?: number;
  creationDate?: Date;
  type: PAYROLL_TYPE;
  typeDescription: string;
  exclusionType: string;
  blobName?: string;
  fileName?: string;
  fileExtension?: string;
  fileMimeType?: string;
  policy: number;
  contractorRut: string;
  contractorName: string;
  subsidiaryCode?: number;
  subsidiaryRut: string;
  subsidiaryName: string;
  plan: string;
  planCode: string;
  group: string;
  idGroup?: string;
  groupName: string;
  capitalRequired: boolean;
  incomeRequired: boolean;
  status?: string;
  statusDetail?: string;
  details?: IPayrollDetailDTO[];
  invalidRows?: number;
  base64?: string;
  buffer?: Buffer;
}

export interface IPayrollDetailDTO {
  id?: number;
  rowNumber?: number;
  payrollId?: number;
  creationDate: Date;
  insuredRut: number;
  insuredDV: string;
  dependentRut: number;
  dependentDV: string;
  name: string;
  lastName: string;
  birthday: Date;
  gender: string;
  contractDate: Date;
  initDate: Date;
  endDate: Date;
  income: string;
  capital: string;
  email: string;
  bank: string;
  bankName: string;
  bankAccountNumber: number;
  kinship: string;
  phone: string;
  isapre: string;
  status?: string;
  invalidDetail?: string;
}

export interface IValidateChangeSubsidiary {
  insuredRut: string;
  insuredDV: string;
  days30AgoDate: Date;
}

export interface IValidateChangePlan {
  insuredRut: string;
  insuredDV: string;
  days30AgoDate: Date;
  capitalRequired: boolean;
  incomeRequired: boolean;
  capital: number;
  income: number;
}

export interface IValidateExclusionInsured {
  insuredRut: string;
  insuredDV: string;
  days30AgoDate: Date;
}

export interface IValidateInclXLSInput {
  sh: Worksheet;
  days30AgoDate: Date;
  payroll: IPayrollDTO;
  policyData: IPolicy;
  bancos: IValueObjectV1[];
  kinships: string[];
  previsiones: IValueObjectV1[];
}

export interface IValidateInclusionInsured {
  insuredRut: string;
  insuredDV: string;
  dependentRut: string;
  dependendDV: string;
  name: string;
  lastName: string;
  gender: string;
  days30AgoDate: Date;
  kinship: string;
  email: string;
  capitalRequired: boolean;
  incomeRequired: boolean;
  capital: number;
  income: number;
  bank: string;
  bankAccountNumber: number;
  phone: string;
  isapre: string;
}

export interface IValidateVirtualSubscription {
  policy: number;
  insuredRut: string;
  dependentRut: string;
  email: string;
  groupCode: number;
  capitalRequired: boolean;
  incomeRequired: boolean;
  income: number;
  capital: number;
  full: string;
}
