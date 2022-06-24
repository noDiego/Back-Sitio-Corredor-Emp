import { IInsured } from '../../../domain/interfaces/dto/v3/IInsured';
import { IInsuredGroup } from '../../../domain/interfaces/dto/v3/IInsuredGroup';
import { ISubsidiary } from '../../../domain/interfaces/dto/v3/ISubsidiary';
import { dateValidation, rutCreate } from '../../../utils/validators';
import { IPlan, IProduct } from '../../../domain/interfaces/dto/v3/IPlan';
import { InsuredShort } from '../dto/insured';
import { ICodeObject } from '../../../domain/interfaces/dto/v3/ICodeObject';
import { Product } from '../dto/plan';

export default (insured: InsuredShort): IInsured => {
  const civilStatus: ICodeObject = {
    code: String(insured.civilStatus.code),
    name: insured.civilStatus.name
  };

  const gender: ICodeObject = {
    code: insured.gender.code,
    name: insured.gender.name
  };

  const insuredGroup: IInsuredGroup = {
    idGroup: insured.insuredGroup.idGroup,
    code: insured.insuredGroup.code,
    name: insured.insuredGroup.name,
    startDate: dateValidation(insured.insuredGroup.startDate),
    endDate: dateValidation(insured.insuredGroup.endDate),
    planCode: insured.insuredGroup.planCode,
    subsidiaryCode: insured.insuredGroup.subsidiaryCode,
    collectiongGroupCode: insured.insuredGroup.collectiongGroupCode
  };

  const subsidiary: ISubsidiary = {
    code: insured.subsidiary.code,
    rut: rutCreate(insured.subsidiary.rut, insured.subsidiary.dv),
    name: insured.subsidiary.name
  };

  const plan: IPlan = {
    code: insured.plan.code,
    name: insured.plan.name
  };

  const products: IProduct[] = [];
  if (insured.products) {
    insured.products.forEach((product: Product) => {
      products.push({ code: product.code, name: product.name, tokenDoc: product.tokenDoc });
    });
  }

  return {
    renewalId: insured.renewalId,
    policyNumber: insured.policyNumber,
    code: insured.code,
    rut: rutCreate(insured.rut, insured.dv),
    firstName: insured.firstName,
    lastName: insured.lastName,
    birthDate: dateValidation(insured.birthDate),
    civilStatus: civilStatus,
    gender: gender,
    insuredGroup: insuredGroup,
    subsidiary: subsidiary,
    plan: plan,
    products: products,
    originalStartDate: dateValidation(insured.originalStartDate),
    startDate: dateValidation(insured.startDate),
    endDate: dateValidation(insured.endDate),
    capital: insured.capital,
    rent: insured.rent
  };
};
