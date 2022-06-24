export interface Plan {
  code: number;
  name: string;
  requiresCapital?: string;
  requiresRent?: string;
  products?: Product[];
}

export interface Product {
  code: number;
  name: string;
  hasCertificate?: string;
  tokenDoc?: string;
  coverages?: PlanCoverage[];
}

// export interface PlanCoverage {
//   planCode: number;
//   productId: number;
//   code: string;
//   name: string;
//   appliesBenefitPlan: string;
//   tokenBenefits: string;
// }

export interface PlanCoverage {
  coverageId: string;
  planCode?: number;
  productId?: number;
  code: string;
  name: string;
  appliesBenefitPlan: string;
  tokenBenefits: string;
}
