import { IPayrollDetailDTO, IPayrollDTO } from '../dto/v1/IPayroll';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import { IUserSSO } from '../dto/v3/IUserSSO';

export interface IPayrollService {
  addPayroll(
    payroll: IPayrollDTO,
    detail: IPayrollDetailDTO,
    beneficiaries: string[],
    user: IUserSSO
  ): Promise<IResponseDTO>;

  addVirtualSubscription(
    payroll: IPayrollDTO,
    detail: IPayrollDetailDTO,
    beneficiaries: string[],
    user: IUserSSO
  ): Promise<IResponseDTO>;

  createPayroll(file: any, payroll: IPayrollDTO, user: IUserSSO): Promise<IResponseDTO>;

  downloadPayrollFile(payrollId: number, user: IUserSSO): Promise<IResponseDTO>;

  getHistoryPayrollData(
    dayRange: number,
    type: string,
    page: number,
    limit: number,
    contractorRut: string,
    insuredRut: string
  ): Promise<IResponseDTO>;
}
