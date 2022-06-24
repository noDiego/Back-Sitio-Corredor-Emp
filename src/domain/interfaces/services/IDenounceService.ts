import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import { IDenounceDTO, IDenounceSearchRequestDTO } from '../dto/v1/IDenounce';
import { IUserSSO } from '../dto/v3/IUserSSO';
import { IDenounceApplicationDTO } from '../dto/v1/IDenounceApplication';
import { IDenounceFileDTO } from '../dto/v1/IDenounceFile';
import * as exceljs from 'exceljs';

export interface IDenounceService {
  searchInsuredDenounces(
    policy: number,
    insuredRut: string,
    monthRangeDate: number,
    page: number,
    limit: number,
    user: IUserSSO
  ): Promise<IResponseDTO>;

  findDenounce(requestNumber: number, user: IUserSSO): Promise<IDenounceDTO>;

  getDenounceApplicationForm(insuredRut: string, policyNumber: number, user: IUserSSO): Promise<IResponseDTO>;

  deleteDenounceApplication(id: number, rutUser: string): Promise<IResponseDTO>;

  createDenounceApplication(inputData: IDenounceApplicationDTO, user: IUserSSO): Promise<IDenounceApplicationDTO>;

  createDenounceFile(inputData: IDenounceFileDTO): Promise<IResponseDTO>;

  searchDenounces(user: IUserSSO, data: string, paramsRequest: IDenounceSearchRequestDTO): Promise<IResponseDTO>;

  generateXLSDenounce(user: IUserSSO, paramsRequest: IDenounceSearchRequestDTO): Promise<exceljs.Buffer>;

  createDenounceApplicationList(
    inputList: IDenounceApplicationDTO[],
    user: IUserSSO
  ): Promise<IDenounceApplicationDTO[]>;

  deleteDenounceApplicationList(inputList: number[], rutUser: string): Promise<IResponseDTO>;

  findDenounceFiles(applicationNumber: number, user: IUserSSO): Promise<IResponseDTO>;

  getLastDenounceDate(
    insuredRut: string,
    companyRut: string,
    policyNumber: number,
    user: IUserSSO
  ): Promise<IResponseDTO>;
}
