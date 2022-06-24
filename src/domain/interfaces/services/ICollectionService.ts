import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import * as exceljs from 'exceljs';
import { ICollectionReportInput } from '../dto/v1/ICollectionReport';
import { IUserSSO } from '../dto/v3/IUserSSO';

export interface ICollectionService {
  searchCollectionsPendingDebt(
    companyRut: string,
    data: string,
    page: number,
    limit: number,
    user: IUserSSO
  ): Promise<IResponseDTO>;

  generateExcelInvoices(companyRut: string, data: string, user: IUserSSO): Promise<exceljs.Buffer>;

  searchPaymentHistory(
    contractRut: string,
    monthRangeDate: number,
    page: number,
    limit: number,
    user: IUserSSO
  ): Promise<IResponseDTO>;

  generateExcelPaymentHistory(contractRut: string, monthRangeDate: number, user: IUserSSO): Promise<exceljs.Buffer>;

  getReports(input: ICollectionReportInput, page: number, limit: number, user: IUserSSO): Promise<IResponseDTO>;
}
