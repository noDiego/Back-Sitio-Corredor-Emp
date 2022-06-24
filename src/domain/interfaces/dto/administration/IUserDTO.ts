import { IClientDTO } from './IClientDTO';
import { IUserSSO } from '../v3/IUserSSO';

export interface IUserDTO {
  rut: string;
  name?: string;
  email?: string;
  clients?: IClientDTO[];
  profiles?: number[];
  type?: string;
  status?: string;
  ssoData?: IUserSSO;
}
