import { Claim } from '../dto/claims';
import { IDenounce } from '../../../domain/interfaces/dto/v3/IDenounce';
import { dateValidation } from '../../../utils/validators';
import { ILegalPerson } from '../../../domain/interfaces/dto/v3/ILegalPerson';
import { DENOUNCE_STATUS } from '../../../constants/status';

export default (claim: Claim): IDenounce => {
  const insured: ILegalPerson = {
    rut: claim.insured.rut,
    dv: claim.insured.dv,
    name: claim.insured.name
  };

  const beneficiary: ILegalPerson = {
    rut: claim.beneficiary.rut,
    dv: claim.beneficiary.dv,
    name: claim.beneficiary.name
  };

  const broker: ILegalPerson = {
    rut: claim.broker.rut,
    dv: claim.broker.dv,
    name: claim.broker.name
  };

  const contractor: ILegalPerson = {
    rut: claim.contractor.rut,
    dv: claim.contractor.dv,
    name: claim.contractor.name
  };

  return {
    consignment: claim.remittanceId,
    applicationNumber: claim.requestNumber,
    policy: claim.policy.policyNumber,
    plan: claim.plan.name,
    startDateContract: dateValidation(claim.startValidityDate),
    endDateContract: dateValidation(claim.endValidityDate),
    firstTerm: null,
    changeFactor: null,
    denounceDate: dateValidation(claim.issueDate),
    liquidationDate: dateValidation(claim.paymentDate),
    insured: insured,
    beneficiary: beneficiary,
    status: DENOUNCE_STATUS.get(claim.requestStatus),
    denounceUser: claim.claimUser,
    broker: broker,
    company: contractor,
    amountClaim: claim.claimedAmount,
    amountPay: claim.paidAmount,
    observation: claim.comments
  };
};
