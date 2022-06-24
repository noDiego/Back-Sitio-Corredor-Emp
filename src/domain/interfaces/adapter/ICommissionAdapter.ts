import { IUserSSO } from '../dto/v3/IUserSSO';
import { Intermediary, ICommissionTotals, ICommissionPeriodsRes } from '../dto/v3/ICommission';

export interface ICommissionAdapter {
  getIntermediaryCode(brokerRut: string, user: IUserSSO): Promise<Intermediary[]>;
  getCommissionPeriods(intermediaryCode: string, user: IUserSSO): Promise<ICommissionPeriodsRes>;
  getCommissionsTotals(intermediaryCode: string, period: number, user: IUserSSO): Promise<ICommissionTotals>;
}
