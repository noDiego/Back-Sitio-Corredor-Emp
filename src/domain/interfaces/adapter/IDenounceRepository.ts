import { IDenounceApplicationDTO as DenounceDTO } from '../dto/v1/IDenounceApplication';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import { IDenounceFileDTO } from '../dto/v1/IDenounceFile';

export interface IDenounceRepository {
  insertDenounce(denounceInput: DenounceDTO): Promise<DenounceDTO>;

  updateDenounce(idDenounce: number, data: any): Promise<IResponseDTO>;

  deleteDenounceById(idDenounceApp: number): Promise<IResponseDTO>;

  getDenounceApp(idDenounceApp: number): Promise<DenounceDTO>;

  insertFile(denounceFileInput: IDenounceFileDTO): Promise<IDenounceFileDTO>;

  deleteFile(idDenounceFile: number): Promise<IResponseDTO>;

  getFileList(idDenounceApp: number): Promise<IDenounceFileDTO[]>;

  getDenounceFile(idFile: number): Promise<IDenounceFileDTO>;

  updateFiles(idDenounceApp: number, data: any): Promise<IResponseDTO>;
}
