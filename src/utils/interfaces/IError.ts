import { HttpError } from '../../infrastructure/clients/dto/httpErrorMayus';

export class IError extends Error {
  code: number;
  status: number;
  serviceName?: string;
  serviceErrorDetail?: IServiceDetail;
  httpError?: HttpError;

  constructor(message: string, name: string, code: number, stack?: string, status?: number) {
    super(message);
    this.name = name;
    this.code = code; //cualquier cosa que no sea 0 es error
    this.stack = stack;
    this.status = status;
    Object.setPrototypeOf(this, IError.prototype);
  }
}

export interface IServiceDetail {
  request: IRequestDetail;
  response: IResponseDetail;
  httpError?: HttpError;
}

export interface IRequestDetail {
  serviceUri: string;
  method: string;
  params?: any;
  data?: any;
}

export interface IResponseDetail {
  status: number;
  statusText: string;
  data: any;
}
