import { CommissionPeriodsRes } from '../dto/commission';
import { ICommissionPeriodsRes } from '../../../domain/interfaces/dto/v3/ICommission';

export default (period: CommissionPeriodsRes): ICommissionPeriodsRes => {
  return period;
};
