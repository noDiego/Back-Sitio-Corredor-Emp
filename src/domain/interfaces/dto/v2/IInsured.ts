import { IInsuredPolicyDTO } from './IInsuredPolicy';

export interface IInsuredV2 {
  rut: string;
  name: string;
  lastname: string;
  birthday: Date;
  maritalStatus: string;
  policies: Array<IInsuredPolicyDTO>;
}
