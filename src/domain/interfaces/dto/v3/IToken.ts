export interface IToken {
  accessToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  refreshToken: string;
  tokenType: string;
  idToken: string;
  notBeforePolicy: number;
  sessionState: string;
  expireDate?: Date;
  refreshExpireDate?: Date;
}
