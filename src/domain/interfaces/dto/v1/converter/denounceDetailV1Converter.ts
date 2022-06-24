import { IBenefit, IDeductible, IDenounceDetail } from '../../v3/IDenounce';
import { IDenounceDTO } from '../IDenounce';
import denounceV1Converter from './denounceV1Converter';

//Convierte VS Final de Denuncio (V3) a primera version V1
export default (detail?: IDenounceDetail): IDenounceDTO => {
  const denounce: IDenounceDTO = denounceV1Converter(detail.denounce);

  denounce.benefits = [];
  detail.benefits.forEach((benefit: IBenefit) => {
    denounce.benefits.push({
      code: String(benefit.code),
      name: benefit.name,
      sinisterDate: benefit.claimDate,
      incurredExpense: 0, //TODO: ???  MCADIS
      isapreContribution: benefit.isapreContribution,
      chargedAmount: benefit.changesAmount, //TODO: ???  MCADIS
      bmiAmount: benefit.bmiAmount,
      coveragePercent: benefit.coveragePercentage,
      base: benefit.base,
      deductible: benefit.deductible,
      refund: benefit.refund
    });
  });
  denounce.deductibles = [];
  detail.deductibles.forEach((deductible: IDeductible) => {
    denounce.deductibles.push({
      concept: 'string',
      individualAccumulatedRefund: 0,
      familyAccumulatedRefund: 0,
      individualPreviousDeductible: 0,
      familyPreviousDeductible: 0,
      individualAccumulatedDeductible: 0,
      familyAccumulatedDeductible: 0,
      individualAnnualDeductible: 0,
      familyAnnualDeductible: 0,
      annualCap: Number(deductible.annualLimit)
    });
  });

  // denounce.payment = detail.paymentType; //TODO: Conversion pendiente MCADIS

  return denounce;
};
