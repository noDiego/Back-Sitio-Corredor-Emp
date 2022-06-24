import { InsuranceRequirement } from '../dto/insuranceRequirement';
import { IInsuranceRequirement } from '../../../domain/interfaces/dto/v3/IInsuranceRequirement';
import { rutCreate } from '../../../utils/validators';

export default (input?: InsuranceRequirement): IInsuranceRequirement => {
  const insuranceReq: IInsuranceRequirement = {
    requirements: input.requirement,
    idRequirement: input.idRequirement,
    insured: {
      id: input.insurance.id,
      rut: rutCreate(input.insurance.rut, input.insurance.dv),
      name: input.insurance.name,
      capital: input.insurance.capital,
      subsidiary: {
        name: ''
      }
    },
    policy: input.policy.policyNumber,
    requestDate: input.requirementDate,
    requestType: input.requirementType,
    token: input.tokenNote
  };
  return insuranceReq;
};
