import { IPayrollDetailDTO, IPayrollDTO } from '../dto/v1/IPayroll';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';

export interface IPayrollRepository {
  insertPayroll(payrollInput: IPayrollDTO): Promise<IPayrollDTO>;

  deletePayroll(id: number): Promise<IResponseDTO>;

  updatePayroll(payrollInput: IPayrollDTO): Promise<IPayrollDTO>;

  addPayrollDetail(detail: IPayrollDetailDTO): Promise<IPayrollDetailDTO>;

  getPayrollById(id: number): Promise<IPayrollDTO>;

  getPayrollsData(): Promise<IPayrollDTO[]>;

  getPayrollsHistoryByEstado(
    startDate: Date,
    endDate: Date,
    type: string,
    estados: string[],
    contractorRut: string
  ): Promise<IPayrollDTO[]>;

  getPayrollsHistoryByInsuredRut(
    startDate: Date,
    endDate: Date,
    type: string,
    estados: string[],
    contractorRut: string,
    insuredRut: string
  ): Promise<IPayrollDTO[]>;
}
