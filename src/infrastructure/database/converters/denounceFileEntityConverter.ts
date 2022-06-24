import { DenounceFile } from '../entities/denounceFile';
import { IDenounceFileDTO } from '../../../domain/interfaces/dto/v1/IDenounceFile';

export default (denounceFile?: DenounceFile): IDenounceFileDTO => {
  return {
    id: denounceFile.id,
    blobName: denounceFile.blobName,
    creationDate: denounceFile.creationDate,
    denounceApplicationID: denounceFile.denounceApp.id,
    extension: denounceFile.extension,
    mimeType: denounceFile.mimeType,
    name: denounceFile.name,
    status: denounceFile.status
  };
};
