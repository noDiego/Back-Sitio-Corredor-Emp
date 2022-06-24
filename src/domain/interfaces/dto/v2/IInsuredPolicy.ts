import { IGroupDTO } from './IGroup';
import { IPlanV2 } from './IPlan';
import { IBankAccountDTO } from './IBankAccount';
import { IValueObjectV1 } from '../v1/IValueObject';
import { IContactDataDTO } from './IContactData';
import { IExpenseHistoryDTO } from './IExpenseHistory';
import { ISubsidiaryV2 } from './ISubsidiary';
import { IDependent } from '../v3/IInsured';

export interface IInsuredPolicyDTO {
  policyNumber: number;
  renovation: number;
  startDate: Date;
  endDate: Date;
  firstTerm: Date;

  bankAccount?: IBankAccountDTO;
  contactData?: IContactDataDTO;
  isapre?: IValueObjectV1;
  familyGroup?: Array<IDependent>;
  plan?: IPlanV2;
  healthExpense?: Array<IExpenseHistoryDTO>;
  group?: IGroupDTO;
  subsidiary?: ISubsidiaryV2;
}
