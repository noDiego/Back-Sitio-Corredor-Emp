export interface IResponseDTO {
  code: number; //0 ok; 1 error
  message: string;
  data?: any;
  page?: number;
  limit?: number;
  totalPage?: number;
  recordTotal?: number;
}

export interface IPagedResponse<T> extends IResponseDTO {
  data: T[];
}

export interface IResponseFileDTO {
  code: number; //0 ok; 1 error
  message: string;
  file: Buffer;
  mimeType: string;
  fileName: string;
}
