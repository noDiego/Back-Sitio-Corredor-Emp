import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import { IUserSSO } from '../dto/v3/IUserSSO';

export interface ICommissionService {
  searchIntermediaryCode(user: IUserSSO): Promise<IResponseDTO>;

  searchCommissionPeriods(intermediaryCode: string, user: IUserSSO): Promise<IResponseDTO>;

  searchCommissionsTotal(intermediaryCode: string, period: number, user: IUserSSO): Promise<IResponseDTO>;
}
