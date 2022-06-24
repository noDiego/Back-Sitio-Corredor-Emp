import {
  IAccountBank,
  IBeneficiaryVersion,
  IContactInfo,
  IDependent,
  IFamilyGroup,
  IInsured,
  IVersion
} from '../../../domain/interfaces/dto/v3/IInsured';
import { IInsuredGroup } from '../../../domain/interfaces/dto/v3/IInsuredGroup';
import { ISubsidiary } from '../../../domain/interfaces/dto/v3/ISubsidiary';
import { dateValidation, rutCreate } from '../../../utils/validators';
import { IPlan } from '../../../domain/interfaces/dto/v3/IPlan';
import { ICodeObject } from '../../../domain/interfaces/dto/v3/ICodeObject';
import { InsuredDetail, Version, Dependent } from '../dto/insured';

export default (insured: InsuredDetail): IInsured => {
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

  const bank: ICodeObject = {
    code: String(insured.accountBank.bank.bankCode),
    name: insured.accountBank.bank.bankName
  };

  const accountType: ICodeObject = {
    code: String(insured.accountBank.accountType.accountCode),
    name: insured.accountBank.accountType.accountName
  };

  const accountBank: IAccountBank = {
    bank: bank,
    accountType: accountType,
    accountNumber: insured.accountBank.accountNumber
  };

  const commune: ICodeObject = {
    code: String(insured.contactInfo.commune.communeCode),
    name: insured.contactInfo.commune.communeName
  };

  const city: ICodeObject = {
    code: String(insured.contactInfo.city.cityCode),
    name: insured.contactInfo.city.cityName
  };

  const region: ICodeObject = {
    code: String(insured.contactInfo.region.regionCode),
    name: insured.contactInfo.region.regionName
  };

  const contactInfo: IContactInfo = {
    address: insured.contactInfo.address,
    commune: commune,
    city: city,
    region: region,
    emailAddress: insured.contactInfo.emailAddress,
    phoneNumber: insured.contactInfo.phoneNumber,
    cellPhone: insured.contactInfo.cellPhone
  };

  const isapre: ICodeObject = {
    code: insured.isapre.code,
    name: insured.isapre.name
  };

  const dependents: IDependent[] = [];
  if (insured.familyGroup.dependent) {
    insured.familyGroup.dependent.forEach((dependent: Dependent) => {
      const relationship: ICodeObject = {
        code: dependent.relationship.code,
        name: dependent.relationship.name
      };

      const gender: ICodeObject = {
        code: dependent.gender.code,
        name: dependent.gender.name
      };

      dependents.push({
        id: dependent.id,
        rut: rutCreate(dependent.rut, dependent.dv),
        firstName: dependent.firstName,
        lastName: dependent.lastName,
        birthDate: dateValidation(dependent.birthDate),
        relationship: relationship,
        gender: gender,
        originalStartDate: dateValidation(dependent.originalStartDate),
        startDate: dateValidation(dependent.startDate),
        endDate: dateValidation(dependent.endDate)
      });
    });
  }

  const familyGroup: IFamilyGroup = {
    dependent: dependents
  };

  const versions: IVersion[] = [];
  insured.beneficiaryVersion.version.forEach((version: Version) => {
    versions.push({
      versionCode: version.versionCode,
      beneficiaries: [] //TODO
    });
  });

  const beneficiaryVersion: IBeneficiaryVersion = {
    version: versions
  };

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
    originalStartDate: dateValidation(insured.originalStartDate),
    startDate: dateValidation(insured.startDate),
    endDate: dateValidation(insured.endDate),
    capital: insured.capital,
    rent: insured.rent,
    accountBank: accountBank,
    contactInfo: contactInfo,
    isapre: isapre,
    familyGroup: familyGroup,
    beneficiaryVersion: beneficiaryVersion,
    activeDependents: insured.activeDependents
  };
};
