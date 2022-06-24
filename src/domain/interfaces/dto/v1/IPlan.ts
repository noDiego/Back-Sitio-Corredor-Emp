import { ICoverageDTO } from './ICoverage';

export interface IPlanV1 {
  code: string;
  name: string;
  startDate: Date;
  endDate: Date;
  hasCertificated?: boolean;
  coverages: Array<ICoverageDTO>;
  requiresCapital: boolean;
  requiresRent: boolean;
}
