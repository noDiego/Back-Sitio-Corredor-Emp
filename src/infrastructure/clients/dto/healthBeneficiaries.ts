export interface Policy {
  renewalIdtrassa: number;
  policyNumber: number;
}

export interface ClaimType {
  code: string;
  name: string;
}

export interface PlanBeneficiaries {
  code: number;
  name: string;
  claimTypes: ClaimType[];
}

export interface Beneficiary {
  correlative: number;
  rut: number;
  dv: string;
  name: string;
  relacion: string;
}

export interface HealthBeneficiary {
  policy: Policy;
  planBeneficiaries: PlanBeneficiaries;
  beneficiary: Beneficiary;
}

export interface HealthBeneficiaryResponse {
  healthBeneficiaries: HealthBeneficiary[];
}
