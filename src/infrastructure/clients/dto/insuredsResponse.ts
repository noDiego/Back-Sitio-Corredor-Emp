import { Pagination } from './pagination';
import { InsuredShort } from './insured';

export interface InsuredsResponse {
  insureds: Array<InsuredShort>;
  pagination: Pagination;
}
