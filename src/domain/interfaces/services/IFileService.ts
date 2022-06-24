import { IResponseDTO, IResponseFileDTO } from '../../../utils/interfaces/IResponse';
import { IDenounceFileDTO } from '../dto/v1/IDenounceFile';
import { IUserSSO } from '../dto/v3/IUserSSO';
import { IPayrollDTO } from '../dto/v1/IPayroll';
import { IReportDetail } from '../dto/v1/ICollectionReport';

export interface IFileService {
  getProductCerticated(policyNumber: number, insuredRut: string, productCode: number, user: IUserSSO): Promise<Buffer>;

  getFile(downloadToken: number, user: IUserSSO): Promise<IResponseFileDTO>;

  getPolicyContract(downloadToken: number, user: IUserSSO): Promise<Buffer>;

  createDenounceFile(file: any, denounceId: number): Promise<IResponseDTO>;

  downloadDenounceFile(denounceFileId: number, user: IUserSSO): Promise<IDenounceFileDTO>;

  deleteDenounceFile(denounceFileId: number, user: IUserSSO): Promise<IResponseDTO>;

  downloadPayrollFile(payrollId: number, detailFile: boolean, user: IUserSSO): Promise<IPayrollDTO>;

  downloadCollectionReports(reports: IReportDetail[], user: IUserSSO): Promise<IResponseFileDTO>;

  getInvoice(invoice: number, typeInvoice: string, user: IUserSSO): Promise<Buffer>;

  generatePrescriptionDocument(
    insuredRut: string,
    policyNumber: number,
    requestNumber: number,
    user: IUserSSO
  ): Promise<IResponseFileDTO>;
}
