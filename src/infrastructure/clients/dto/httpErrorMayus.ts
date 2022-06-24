export interface HttpErrorMayus {
  HttpCode: number;
  HttpMessage: string;
  MoreInformation: string;
  UserFriendlyError?: string;
}

export interface HttpError {
  //TODO: Servicios retornan con mayuscula y minuscula en distintos casos
  httpCode: number;
  httpMessage: string;
  moreInformation: string;
  userFriendlyError?: string;
}
