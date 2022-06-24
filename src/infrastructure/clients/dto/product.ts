import { Coverage } from './coverage';

export interface PolicyCoverage {
  code: number;
  name: string;
  products?: Product[];
}

export interface Product {
  code: number;
  name: string;
  hasCertificate?: string;
  coverages?: Coverage[];
}
