import { IToken } from './IToken';

export interface IUserSSO {
  sub: string;
  name: string;
  preferredUsername: string;
  givenName: string;
  familyName: string;
  email: string;
  tokenData?: IToken;
  authorizationToken?: string;
  transactionID?: string;
  operationID?: string;
}
