import { IPolicy } from '../../v3/IPolicy';
import { IInsuredPolicyV1 } from '../IInsuredPolicy';
import { IInsured } from '../../v3/IInsured';

//Convierte VS Final de IInsured (V3) a IInsuredPolicyV1
export default (insured: IInsured): IInsuredPolicyV1[] => {
  const insuredPolicies: IInsuredPolicyV1[] = [];
  insured.policies.forEach((policy: IPolicy) => {
    insuredPolicies.push({
      policyNumber: policy.policyNumber,
      rutSubsidiary: insured.subsidiary.rut,
      subsidiary: insured.subsidiary.name,
      codeGroup: insured.insuredGroup.code,
      group: insured.insuredGroup.name,
      rut: insured.rut,
      name: insured.firstName + ' ' + insured.lastName,
      hasHealthBenefits: policy.hasHealthBenefits
    });
  });

  return insuredPolicies;
};
