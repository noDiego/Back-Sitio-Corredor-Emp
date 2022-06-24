import { ICoverageDTO } from '../v1/ICoverage';

export interface IProductV2 {
  code: number;
  name: string;
  hasCertificated: boolean;
  downloadToken: number;
  startDate?: Date;
  endDate?: Date;
  coverages?: Array<ICoverageDTO>;
}
