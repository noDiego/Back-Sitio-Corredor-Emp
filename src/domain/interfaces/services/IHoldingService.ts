import { IUserSSO } from '../dto/v3/IUserSSO';
import { IHoldingDTO } from '../dto/v1/IHolding';

export interface IHoldingService {
  getHolding(user: IUserSSO): Promise<IHoldingDTO[]>;
}
