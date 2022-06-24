import { IPolicyV1 } from '../IPolicy';
import { IPlanV1 } from '../IPlan';
import { ISubsidiaryV1 } from '../ISubsidiary';
import { IInsuredDTO, IPlanInsuredFileDTO } from '../IInsured';
import { IDependent, IInsured } from '../../v3/IInsured';
import { IBeneficiaryDTO } from '../IBeneficiary';
import Utils from '../../../../../utils/utils';
import { ICoverageDTO } from '../ICoverage';
import { IContractor } from '../../v3/IContractor';
import { IPolicy } from '../../v3/IPolicy';
import { IProduct } from '../../v3/IPlan';
import { ICoverage } from '../../v3/ICoverage';

//Convierte VS Final de Insured (V3) a primera version V1
export default (insured?: IInsured): IInsuredDTO => {
  const beneficiaries: IBeneficiaryDTO[] = [];
  insured.familyGroup.dependent.forEach((dependent: IDependent) => {
    beneficiaries.push({
      rut: dependent.rut,
      name: dependent.firstName + ' ' + dependent.lastName,
      kinship: dependent.relationship.name,
      age: Utils.calculateAge(dependent.birthDate),
      startDate: dependent.startDate,
      endDate: dependent.endDate
    });
  });

  const subsidiaries: ISubsidiaryV1[] = [];
  subsidiaries.push({
    rut: insured.subsidiary.rut,
    name: insured.subsidiary.name
  });

  const plans: IPlanV1[] = [];
  insured.products.forEach((product: IProduct) => {
    const coverages: ICoverageDTO[] = [];
    product.coverages.forEach((coverage: ICoverage) => {
      coverages.push({
        code: String(coverage.code),
        name: coverage.name,
        capital: coverage.capital,
        top: coverage.limit,
        downloadToken: +coverage.tokenBenefits,
        premium: coverage.premium,
        grant: 0 //TODO
      });
    });
    plans.push({
      code: String(product.code),
      name: product.name,
      startDate: insured.startDate,
      endDate: insured.endDate,
      hasCertificated: product.hasCertificate,
      coverages: coverages,
      requiresCapital: false,
      requiresRent: false
    });
  });

  const plan: IPlanInsuredFileDTO = {
    code: insured.plan.code,
    name: insured.plan.name
  };

  let contractor: IContractor = null;
  let policyV3: IPolicy = null;
  if (insured.policies.length > 0) {
    policyV3 = insured.policies[0];
    contractor = {
      rut: policyV3.company.rut,
      name: policyV3.company.name
    };
  }
  const policy: IPolicyV1 = {
    number: insured.policyNumber,
    renewalId: insured.renewalId,
    contractor: contractor,
    status: policyV3.status,
    startDate: insured.startDate,
    endDate: insured.endDate,
    firstTerm: insured.originalStartDate,
    renovation: policyV3.renewal,
    incumbentQuantity: policyV3.numberOfHolders,
    dependentQuantity: policyV3.numberOfBeneficiaries,
    subsidiaries: subsidiaries,
    plans: plans
  };

  return {
    rut: insured.rut,
    firstName: insured.firstName,
    lastName: insured.lastName,
    birthday: insured.birthDate,
    maritalStatus: insured.civilStatus.name,
    codeBank: insured.accountBank.bank.code,
    bankName: insured.accountBank.bank.name,
    codeAccountType: insured.accountBank.accountType.code,
    bankAccountType: insured.accountBank.accountType.name,
    bankAccountNumber: insured.accountBank.accountNumber,
    address: insured.contactInfo.address,
    codeComuna: insured.contactInfo.commune.code,
    commune: insured.contactInfo.commune.name,
    codeCiudad: insured.contactInfo.city.code,
    city: insured.contactInfo.city.name,
    codeRegion: insured.contactInfo.region.code,
    region: insured.contactInfo.region.name,
    email: insured.contactInfo.emailAddress,
    phone: insured.contactInfo.phoneNumber,
    cellphone: insured.contactInfo.cellPhone,
    isapreCode: insured.isapre.code,
    isapre: insured.isapre.name,
    policy: policy,
    plans: plans,
    plan: plan,
    beneficiaries: beneficiaries,
    policies: insured.policiesNumberList
  };
};
