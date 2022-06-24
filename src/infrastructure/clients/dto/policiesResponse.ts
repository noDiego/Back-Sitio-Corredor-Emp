import { PolicyShort } from './policy';
import { Pagination } from './pagination';

export interface PoliciesResponse {
  policies: Array<PolicyShort>;
  pagination: Pagination;
}
