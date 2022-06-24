export interface IInsuredPolicyV1 {
  policyNumber?: number;
  rutSubsidiary?: string;
  subsidiary?: string;
  codeGroup?: number;
  group?: string;
  name: string;
  rut: string;
  hasHealthBenefits?: boolean;
}
