import { FileResponse } from '../dto/common';
import { File } from '../../../domain/interfaces/dto/v3/IFile';

export default (fileResponse: FileResponse): File => {
  return {
    fileName: fileResponse.file.fileName,
    fileExtension: fileResponse.file.fileExtension,
    base64: fileResponse.file.base64
  };
};
