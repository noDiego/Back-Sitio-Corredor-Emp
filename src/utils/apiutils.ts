import { HttpError } from '../infrastructure/clients/dto/httpErrorMayus';
import { IPagedResponse } from '../domain/interfaces/dto/v1/IResponse';
import { IResponseDTO } from './interfaces/IResponse';

//Utils para API de VS
export function resolveError(error: any, serviceName: string, isPaginated = false): any {
  const apiErrorMessage = 'VS API ERROR';
  if (error.response && error.response.status == 404) {
    return isPaginated ? buildPagedResponse<any>([], 1, 1, 0) : null;
  } else if (error.response) {
    const httpError: HttpError = error.response.data ? fixHttpError(error.response.data) : undefined;
    throw {
      code: 1,
      message: `[${apiErrorMessage}] ${error.message}`,
      serviceName: serviceName,
      serviceErrorDetail: {
        request: !error.config
          ? undefined
          : {
              serviceUri: error.config.url,
              method: error.config.method,
              params: error.config.params,
              data: error.config.data
            },
        response: {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data ? error.response.data : '<NO DATA>'
        },
        httpError: httpError
      },
      status: 500
    };
  } else
    throw {
      code: -1,
      message: `[${apiErrorMessage}] ${error.message}`,
      serviceName: serviceName,
      status: 500,
      stack: error
    };
}

export function buildPagedResponse<T>(data: T[], page: number, limit: number, quotaMax: number): IPagedResponse<T> {
  const haveData: boolean = data && data.length > 0;

  return {
    code: !haveData ? 1 : 0,
    data: data,
    message: !haveData ? 'SIN DATOS' : 'OK',
    recordTotal: quotaMax,
    totalPage: Math.ceil(quotaMax / limit),
    page: page
  };
}

export function returnEmpty(page?: number, limit?: number): IResponseDTO {
  return {
    code: 1,
    message: 'NO DATA',
    data: [],
    page: page,
    limit: limit,
    totalPage: page ? 0 : undefined,
    recordTotal: page ? 0 : undefined
  };
}

export function getProductName(productCode: number): string {
  switch (productCode) {
    case 1:
      return 'VIDA';
    case 2:
      return 'SALUD';
    case 3:
      return 'ACCIDENTES';
    case 4:
      return 'DEGRAVAMEN';
  }
}

export function fixHttpError(data: any): HttpError {
  if (!!data.HttpCode || !!data.httpCode)
    return {
      httpCode: data.HttpCode ? data.HttpCode : data.httpCode,
      httpMessage: data.HttpMessage ? data.HttpMessage : data.httpMessage,
      moreInformation: data.MoreInformation ? data.MoreInformation : data.moreInformation,
      userFriendlyError: data.UserFriendlyError ? data.UserFriendlyError : data.userFriendlyError
    };
  else return undefined;
}
