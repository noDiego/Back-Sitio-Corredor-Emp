import { IInsured } from '../../v3/IInsured';
import { IInsuredV2 } from '../../v2/IInsured';

//Convierte VS Final de Poliza (V3) a primera version V1
export default (insured?: IInsured): IInsuredV2 => {
  return {
    rut: insured.rut,
    name: insured.firstName,
    lastname: insured.lastName,
    birthday: insured.birthDate,
    maritalStatus: insured.civilStatus.name,
    policies: [
      {
        policyNumber: insured.policyNumber,
        renovation: insured.renewalId,
        startDate: insured.startDate,
        endDate: insured.endDate,
        firstTerm: insured.startDate,
        group: {
          code: String(insured.insuredGroup.code),
          name: insured.insuredGroup.name
        },
        plan: {
          code: insured.plan.code,
          name: insured.plan.name,
          startDate: insured.plan.startDate,
          endDate: insured.plan.endDate,
          capitalRequired: insured.plan.requiresCapital,
          incomeRequired: insured.plan.requiresRent
        },
        subsidiary: {
          code: String(insured.subsidiary.code),
          name: insured.subsidiary.name,
          rut: insured.subsidiary.rut
        },
        familyGroup: insured.familyGroup ? insured.familyGroup.dependent : []
      }
    ]
  };
};
