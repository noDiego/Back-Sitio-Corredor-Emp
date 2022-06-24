import { InsuredDeductible } from '../../../domain/interfaces/dto/v3/IInsured';
import { rutCreate } from '../../../utils/validators';
import { InsuredDeductibleResponse, InsuredDeductible as IInsuredDeductible } from '../dto/insured';

export default (insuredDeductibles: InsuredDeductibleResponse): InsuredDeductible[] => {
  const insuredDeductiblesList: InsuredDeductible[] = [];
  insuredDeductibles.deductibles.forEach((deductible: IInsuredDeductible) => {
    insuredDeductiblesList.push({
      beneficiaryName: deductible.beneficiary.name,
      beneficiaryRut: rutCreate(deductible.beneficiary.rut, deductible.beneficiary.dv),
      dentalAmount: deductible.accumulatedSaludDental,
      healthAmount: deductible.accumulatedSalud
    });
  });

  return insuredDeductiblesList;
};
