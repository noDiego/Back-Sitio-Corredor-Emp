import payrollDetailEntityConverter from './payrollDetailEntityConverter';
import { Payroll } from '../entities/payroll';
import { IPayrollDetailDTO, IPayrollDTO } from '../../../domain/interfaces/dto/v1/IPayroll';
import { PAYROLL_TYPE } from '../../../constants/types';
import { PayrollDetail } from '../entities/payrollDetail';

export default (payrollEntity: Payroll): IPayrollDTO => {
  const detailIds: number[] = [];
  const payrollDetailDTO: IPayrollDetailDTO[] = [];
  if (payrollEntity.details && payrollEntity.details.length > 0) {
    payrollEntity.details.forEach((detail: PayrollDetail) => {
      detailIds.push(detail.id);
    });

    payrollEntity.details.forEach((detail: PayrollDetail) => {
      payrollDetailDTO.push(payrollDetailEntityConverter(detail));
    });
  }
  return {
    id: payrollEntity.id,
    creationDate: payrollEntity.creationDate,
    type: PAYROLL_TYPE[payrollEntity.type],
    typeDescription: payrollEntity.typeDescription,
    exclusionType: payrollEntity.exclusionType,
    blobName: payrollEntity.blobName,
    fileName: payrollEntity.fileName,
    fileExtension: payrollEntity.fileExtension,
    fileMimeType: payrollEntity.fileMimeType,
    policy: payrollEntity.policy,
    contractorRut: payrollEntity.contractorRut,
    contractorName: payrollEntity.contractorName,
    subsidiaryRut: payrollEntity.subsidiaryRut,
    subsidiaryName: payrollEntity.subsidiaryName,
    subsidiaryCode: payrollEntity.subsidiaryCode,
    plan: payrollEntity.plan,
    planCode: payrollEntity.planCode,
    group: payrollEntity.group,
    groupName: payrollEntity.groupName,
    capitalRequired: payrollEntity.capitalRequired,
    incomeRequired: payrollEntity.incomeRequired,
    details: payrollDetailDTO,
    status: payrollEntity.status,
    invalidRows: payrollEntity.invalidRows
  };
};
