import { BlobUploadCommonResponse } from '@azure/storage-blob';

export interface IResponseDTO {
  code: number; //0 ok; -1 error: 1 sin datos
  message: string;
  data?: any;
  page?: number;
  limit?: number;
  totalPage?: number;
  recordTotal?: number;
}

export interface IResponseFileDTO {
  code: number; //0 ok; -1 error; 1 sin datos
  message: string;
  file: Buffer;
  mimeType: string;
  fileName: string;
}

export interface IAzureUploadResult {
  success: boolean;
  details?: BlobUploadCommonResponse;
  error?: Error;
}
