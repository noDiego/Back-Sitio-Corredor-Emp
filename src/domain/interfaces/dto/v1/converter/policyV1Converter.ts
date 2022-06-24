import { IPolicy } from '../../v3/IPolicy';
import { IPolicyV1 } from '../../v1/IPolicy';
import { dateValidation } from '../../../../../utils/validators';
import { IProductV1 } from '../../v1/IProduct';
import { IPlanV1 } from '../../v1/IPlan';
import { IPlan, IProduct } from '../../v3/IPlan';
import moment from 'moment';
import { ISubsidiary } from '../../v3/ISubsidiary';
import { ISubsidiaryV1 } from '../ISubsidiary';

//Convierte VS Final de Poliza (V3) a primera version V1
export default (policy?: IPolicy): IPolicyV1 => {
  let productList: IProductV1[];
  let planList: IPlanV1[];
  let subsidiaryList: ISubsidiaryV1[];

  if (policy.products) {
    productList = [];
    policy.products.forEach((product: IProduct) => {
      productList.push({
        code: product.code,
        name: product.name,
        downloadToken: Number(product.tokenDoc)
      });
    });
  }

  if (policy.plans) {
    planList = [];
    policy.plans.forEach((plan: IPlan) => {
      planList.push({
        code: String(plan.code),
        name: plan.name,
        requiresCapital: plan.requiresCapital,
        requiresRent: plan.requiresRent,
        coverages: undefined,
        endDate: moment().add(2, 'days').toDate(),
        startDate: moment().subtract(2, 'days').toDate()
      });
    });
  }

  if (policy.subsidiaries) {
    subsidiaryList = [];
    policy.subsidiaries.forEach((subsidiary: ISubsidiary) => {
      subsidiaryList.push({
        code: subsidiary.code,
        collectionQuantity: 0,
        endDate: moment().add(2, 'days').toDate(),
        startDate: moment().subtract(2, 'days').toDate(),
        groupQuantity: 0,
        groups: undefined,
        name: subsidiary.name,
        rut: subsidiary.rut
      });
    });
  }

  //const productDescriptionList: string[] = policy.productDescription.split(',');

  return {
    contractor: {
      rut: policy.contractor.rut,
      name: policy.contractor.name,
      bussinessLine: policy.company.businessActivity,
      address: policy.contractor.address
    },
    number: policy.policyNumber,
    insuranceCoRut: policy.insuranceCoRut,
    company: policy.company,
    broker: policy.broker,
    endDate: dateValidation(policy.endDate),
    firstTerm: dateValidation(policy.firstTerm),
    startDate: dateValidation(policy.startDate),
    dependentQuantity: policy.numberOfBeneficiaries,
    incumbentQuantity: policy.numberOfHolders,
    insured: [],
    plans: planList,
    products: productList,
    renovation: 0,
    renewalId: policy.renewalId,
    status: policy.status,
    subsidiaries: subsidiaryList,
    summary: {
      subsidiaryQuantity: subsidiaryList ? subsidiaryList.length : undefined,
      insuredGroupQuantity: policy.insuredGroup ? policy.insuredGroup.length : undefined,
      collectionGroupQuantity: policy.collectionGroup ? policy.collectionGroup.length : undefined,
      planQuantity: planList ? planList.length : undefined
    }
  };
};
