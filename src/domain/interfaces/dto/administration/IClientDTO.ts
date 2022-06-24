import { ClientType } from '../../../../constants/types';

export interface IClientDTO {
  rut: string;
  name: string;
  type: ClientType;
  policies?: string[];
  seeAll?: boolean;
  status?: string;
}
