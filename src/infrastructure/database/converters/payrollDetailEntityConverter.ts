import { PayrollDetail } from '../entities/payrollDetail';
import { IPayrollDetailDTO } from '../../../domain/interfaces/dto/v1/IPayroll';

export default (payrollDetailEntity: PayrollDetail): IPayrollDetailDTO => {
  return {
    id: payrollDetailEntity.id,
    rowNumber: payrollDetailEntity.rowNumber,
    payrollId: payrollDetailEntity.payrollId,
    creationDate: payrollDetailEntity.creationDate,
    insuredRut: payrollDetailEntity.insuredRut,
    insuredDV: payrollDetailEntity.insuredDV,
    dependentRut: payrollDetailEntity.dependentRut,
    dependentDV: payrollDetailEntity.dependentDV,
    name: payrollDetailEntity.name,
    lastName: payrollDetailEntity.lastName,
    birthday: payrollDetailEntity.birthday,
    gender: payrollDetailEntity.gender,
    contractDate: payrollDetailEntity.contractDate,
    initDate: payrollDetailEntity.initDate,
    endDate: payrollDetailEntity.endDate,
    income: String(payrollDetailEntity.income),
    capital: String(payrollDetailEntity.capital),
    email: payrollDetailEntity.email,
    bank: payrollDetailEntity.bank,
    bankName: payrollDetailEntity.bankName,
    bankAccountNumber: payrollDetailEntity.bankAccountNumber,
    kinship: payrollDetailEntity.kinship,
    phone: payrollDetailEntity.phone,
    isapre: payrollDetailEntity.isapre,
    status: payrollDetailEntity.status,
    invalidDetail: payrollDetailEntity.invalidDetail
  };
};
