import { IPolicy } from '../../../domain/interfaces/dto/v3/IPolicy';
import { dateValidation, rutCreate } from '../../../utils/validators';
import { PolicyShort } from '../dto/policy';

export default (policy?: PolicyShort): IPolicy => {
  const productDescriptionList: string[] = policy.productDescription.split(',');

  return {
    renewalId: policy.renewalId,
    renewal: policy.renewal,
    policyNumber: policy.policyNumber,
    insuranceCoRut: rutCreate(policy.insuranceCoRut, policy.insuranceCoDv), //?
    holding: {
      number: policy.tradeGroup.number,
      name: policy.tradeGroup.name
    },
    contractor: {
      rut: rutCreate(policy.contractor.rut, policy.contractor.dv),
      name: policy.contractor.name
    },
    company: {
      rut: rutCreate(policy.company.rut, policy.company.dv),
      name: policy.company.name,
      businessActivity: policy.company.businessActivity
    },
    broker: {
      rut: rutCreate(policy.broker.rut, policy.broker.dv),
      name: policy.broker.name
    },
    status: policy.status,
    firstTerm: dateValidation(policy.firstTerm),
    startDate: dateValidation(policy.startDate),
    endDate: dateValidation(policy.endDate),
    productDescription: productDescriptionList,
    numberOfHolders: policy.numberOfHolders,
    numberOfBeneficiaries: policy.numberOfBeneficiaries,
    hasBlockedBenefits: policy.hasBlockedBenefits != 'NO',
    hasDebt: policy.hasDebt != 'NO',
    hasHealthBenefits: policy.hasHealthBenefits != 'NO',
    hasPendingRequirements: policy.hasPendingRequirements != 'NO',
    insuredList: []
  };
};
