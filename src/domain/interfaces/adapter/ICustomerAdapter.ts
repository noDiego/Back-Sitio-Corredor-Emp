import { IUserSSO } from '../dto/v3/IUserSSO';
import { IClient } from '../dto/v3/IClient';

export interface ICustomerAdapter {
  getClientDetails(clientRut: number, userSSO: IUserSSO): Promise<IClient>;
}
