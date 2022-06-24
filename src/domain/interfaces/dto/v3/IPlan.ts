import { ICoverage } from './ICoverage';

export interface IPlan {
  code: number;
  name: string;
  requiresCapital?: boolean;
  requiresRent?: boolean;
  products?: Array<IProduct>;
  startDate?: Date;
  endDate?: Date;
}
export interface IProduct {
  code: number;
  name: string;
  hasCertificate?: boolean;
  tokenDoc?: string;
  coverages?: Array<ICoverage>;
}
