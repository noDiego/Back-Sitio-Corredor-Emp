import { IDenounce, IPaymentType, IDeductible, IBenefit } from '../../v3/IDenounce';
import { IDenounceDTO } from '../IDenounce';
import { IValueObjectV1 } from '../IValueObject';
import { rutCreate } from '../../../../../utils/validators';
import { IPaymentV1 } from '../IPayment';
import { IBenefitDTO } from '../IBenefit';
import { IDeductibleDTO } from '../IDeductible';

//Convierte VS Final de Denuncio (V3) a primera version V1
export default (
  denounce?: IDenounce,
  paymentType?: IPaymentType,
  benefits?: IBenefit[],
  deductibles?: IDeductible[]
): IDenounceDTO => {
  const insured: IValueObjectV1 = {
    code: rutCreate(denounce.insured.rut, denounce.insured.dv),
    name: denounce.insured.name
  };

  const beneficiary: IValueObjectV1 = {
    code: rutCreate(denounce.beneficiary.rut, denounce.beneficiary.dv),
    name: denounce.beneficiary.name
  };

  const broker: IValueObjectV1 = {
    code: rutCreate(denounce.broker.rut, denounce.broker.dv),
    name: denounce.broker.name
  };

  const company: IValueObjectV1 = {
    code: rutCreate(denounce.company.rut, denounce.company.dv),
    name: denounce.company.name
  };

  let payment: IPaymentV1 = null;
  if (paymentType) {
    payment = {
      id: null,
      deposit: null,
      accountNumber: paymentType.bankAccount,
      accountType: null,
      bank: paymentType.bankName,
      costCenter: paymentType.costCenter,
      paymentMethod: paymentType.type
    };
  }

  const deductiblesList: IDeductibleDTO[] = [];
  if (deductibles && deductibles.length > 0) {
    deductibles.forEach((deductible: IDeductible) => {
      deductiblesList.push({
        concept: deductible.concept,
        individualAccumulatedRefund: Number(parseFloat(deductible.individualAccRefund.replace(',', '.')).toFixed(2)),
        familyAccumulatedRefund: Number(parseFloat(deductible.familyAccRefund.replace(',', '.')).toFixed(2)),
        individualPreviousDeductible: Number(
          parseFloat(deductible.individalPrevDeductible.replace(',', '.')).toFixed(2)
        ),
        familyPreviousDeductible: Number(parseFloat(deductible.familyPrevDeductible.replace(',', '.')).toFixed(2)),
        individualAccumulatedDeductible: Number(
          parseFloat(deductible.individualAccDeductible.replace(',', '.')).toFixed(2)
        ),
        familyAccumulatedDeductible: Number(parseFloat(deductible.familyAccDeductible.replace(',', '.')).toFixed(2)),
        individualAnnualDeductible: Number(
          parseFloat(deductible.individualAnnualDeductible.replace(',', '.')).toFixed(2)
        ),
        familyAnnualDeductible: Number(parseFloat(deductible.familyAnnualDeductible.replace(',', '.')).toFixed(2)),
        annualCap: Number(parseFloat(deductible.annualLimit.replace(',', '.')).toFixed(2))
      });
    });
  }

  const benefitsList: IBenefitDTO[] = [];
  if (benefits && benefits.length > 0) {
    benefits.forEach((benefit: IBenefit) => {
      benefitsList.push({
        code: String(benefit.code),
        name: benefit.name,
        sinisterDate: benefit.claimDate,
        incurredExpense: benefit.totalExpenses,
        isapreContribution: benefit.isapreContribution,
        chargedAmount: benefit.changesAmount,
        bmiAmount: benefit.bmiAmount,
        coveragePercent: benefit.coveragePercentage,
        base: benefit.base,
        deductible: benefit.deductible,
        refund: benefit.refund
      });
    });
  }

  return {
    consignment: denounce.consignment,
    applicationNumber: denounce.applicationNumber,
    policy: denounce.policy,
    plan: denounce.plan,
    startDateContract: denounce.startDateContract,
    endDateContract: denounce.endDateContract,
    firstTerm: denounce.firstTerm,
    changeFactor: denounce.changeFactor,
    denounceDate: denounce.denounceDate,
    liquidationDate: denounce.liquidationDate,
    insured: insured,
    beneficiary: beneficiary,
    status: denounce.status == 'APROBADA' ? 'APROBADO' : denounce.status,
    denounceUser: denounce.denounceUser,
    broker: broker,
    company: company,
    amountClaim: denounce.amountClaim,
    amountPay: denounce.amountPay,
    observation: denounce.observation,
    payment: payment,
    benefits: benefitsList,
    deductibles: deductiblesList
  };
};
