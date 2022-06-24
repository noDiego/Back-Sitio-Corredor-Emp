import { HttpErrorMayus, HttpError } from '../dto/httpErrorMayus';
import { IServiceResponse } from '../../../domain/interfaces/dto/v3/IServiceResponse';

export function httpErrorConverter(response: HttpErrorMayus): IServiceResponse {
  return {
    success: response.HttpCode == 200 || response.HttpCode == 201,
    code: response.HttpCode,
    message: response.HttpMessage,
    moreInformation: response.MoreInformation,
    userFriendlyError: response.UserFriendlyError
  };
}
export function httpErrorMinusConverter(response: HttpError): IServiceResponse {
  return {
    success: response.httpCode == 200 || response.httpCode == 201,
    code: response.httpCode,
    message: response.httpMessage,
    moreInformation: response.moreInformation,
    userFriendlyError: response.userFriendlyError
  };
}
