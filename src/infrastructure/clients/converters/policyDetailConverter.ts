import { IPolicy } from '../../../domain/interfaces/dto/v3/IPolicy';
import { Plan, Product } from '../dto/plan';
import { dateValidation, rutCreate } from '../../../utils/validators';
import { IPlan, IProduct } from '../../../domain/interfaces/dto/v3/IPlan';
import { ISubsidiary } from '../../../domain/interfaces/dto/v3/ISubsidiary';
import { IInsuredGroup } from '../../../domain/interfaces/dto/v3/IInsuredGroup';
import { ICollectionGroup } from '../../../domain/interfaces/dto/v3/ICollection';
import { CollectionGroup, PolicyDetail } from '../dto/policy';
import { InsuredGroup, Subsidiary } from '../dto/insured';

export default (policy?: PolicyDetail): IPolicy => {
  const productList: IProduct[] = [];

  policy.products.forEach((product: Product) => {
    productList.push({
      code: product.code,
      name: product.name,
      tokenDoc: product.tokenDoc
    });
  });

  const planList: IPlan[] = [];
  policy.plans.forEach((plan: Plan) => {
    planList.push({
      code: plan.code,
      name: plan.name,
      requiresCapital: plan.requiresCapital != 'NO',
      requiresRent: plan.requiresRent != 'NO',
      products: null
    });
  });

  const subsidiaryList: ISubsidiary[] = [];
  policy.subsidiaries.forEach((subsidiary: Subsidiary) => {
    subsidiaryList.push({
      code: subsidiary.code,
      rut: rutCreate(subsidiary.rut, subsidiary.dv),
      name: subsidiary.name
    });
  });

  const insuredGroupList: IInsuredGroup[] = [];
  policy.insuredGroup.forEach((igroup: InsuredGroup) => {
    insuredGroupList.push({
      idGroup: igroup.idGroup,
      code: igroup.code,
      name: igroup.name,
      startDate: igroup.startDate,
      endDate: igroup.endDate,
      planCode: igroup.planCode,
      subsidiaryCode: igroup.subsidiaryCode,
      collectiongGroupCode: igroup.collectiongGroupCode
    });
  });

  const collectionGroupList: ICollectionGroup[] = [];
  policy.collectionGroup.forEach((cgroup: CollectionGroup) => {
    collectionGroupList.push({
      idGroup: cgroup.idGroup,
      code: cgroup.code,
      rut: rutCreate(cgroup.rut, cgroup.dv),
      name: cgroup.name,
      benefitStatus: cgroup.benefitStatus,
      debtStatus: cgroup.debtStatus,
      currentDebtAmount: cgroup.currentDebtAmount,
      expiredDebtAmount: cgroup.expiredDebtAmount
    });
  });

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
      name: policy.contractor.name,
      bussinessLine: policy.company.businessActivity
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
    products: productList,
    plans: planList,
    subsidiaries: subsidiaryList,
    insuredGroup: insuredGroupList,
    collectionGroup: collectionGroupList,
    hasBlockedBenefits: policy.hasBlockedBenefits != 'NO',
    hasDebt: policy.hasDebt != 'NO',
    hasHealthBenefits: policy.hasHealthBenefits != 'NO',
    hasPendingRequirements: policy.hasPendingRequirements != 'NO',
    insuredList: undefined
  };
};
