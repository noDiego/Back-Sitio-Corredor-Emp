import { IPolicy } from '../../v3/IPolicy';
import { dateValidation } from '../../../../../utils/validators';
import { IPlan } from '../../v3/IPlan';
import moment from 'moment';
import { IPolicyV2 } from '../IPolicy';
import { IPlanV2 } from '../IPlan';

//Convierte VS Final de Poliza (V3) a primera version V2
export default (policy?: IPolicy): IPolicyV2 => {
  const planList: IPlanV2[] = [];
  if (policy.plans) {
    policy.plans.forEach((plan: IPlan) => {
      planList.push({
        code: plan.code,
        name: plan.name,
        capitalRequired: plan.requiresCapital,
        incomeRequired: plan.requiresRent,
        products: undefined,
        endDate: moment().add(2, 'days').toDate(),
        startDate: moment().subtract(2, 'days').toDate()
      });
    });
  }

  //const productDescriptionList: string[] = policy.productDescription.split(',');

  return {
    holding: {
      code: String(policy.holding.number),
      name: policy.holding.name
    },
    productoDescription: policy.productDescription,
    contractor: {
      rut: policy.contractor.rut,
      name: policy.contractor.name,
      bussinessLine: policy.company.businessActivity,
      address: policy.contractor.address
    },
    number: policy.policyNumber,
    insuranceCoRut: policy.insuranceCoRut,
    company: {
      rut: policy.company.rut,
      name: policy.company.name,
      bussinessLine: policy.company.businessActivity
    },
    broker: policy.broker,
    endDate: dateValidation(policy.endDate),
    firstTerm: dateValidation(policy.firstTerm),
    startDate: dateValidation(policy.startDate),
    dependentQuantity: policy.numberOfBeneficiaries,
    incumbentQuantity: policy.numberOfHolders,
    insured: [],
    plans: planList,
    products: policy.products,
    renovation: 0,
    status: policy.status,
    subsidiaries: policy.subsidiaries,
    isBlocked: policy.hasBlockedBenefits,
    hasPendingRequirements: policy.hasPendingRequirements
  };
};
