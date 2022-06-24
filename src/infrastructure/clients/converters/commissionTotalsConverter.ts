import { TotalsResp, TotalPeriodDetail } from '../dto/commission';
import { ICommissionTotals, CommissionTotalType, TotalPeriodType } from '../../../domain/interfaces/dto/v3/ICommission';

export default (totals: TotalsResp): ICommissionTotals => {
  const totalsResp: ICommissionTotals = null;
  const bonds: TotalPeriodType[] = [];
  const commissions: TotalPeriodType[] = [];

  totals.totalPeriodDetails.forEach((total: TotalPeriodDetail) => {
    if (total.concept == CommissionTotalType.BONO) {
      bonds.push({
        codeType: total.conceptName,
        description: total.totalDescription,
        totalAmount: total.totalAmount
      });
    }
    if (total.concept == CommissionTotalType.COMISION) {
      commissions.push({
        codeType: total.conceptName,
        description: total.totalDescription,
        totalAmount: total.totalAmount
      });
    }
  });

  if (bonds.length > 0 || commissions.length > 0) {
    return {
      commissions: commissions,
      bonds: bonds,
      total: null
    };
  }

  return totalsResp;
};
