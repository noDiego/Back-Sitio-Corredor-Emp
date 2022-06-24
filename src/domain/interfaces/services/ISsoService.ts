import { IToken } from '../dto/v3/IToken';
import { IUserSSO } from '../dto/v3/IUserSSO';

export interface ISsoService {
  obtieneToken(authcode: string, redirectUri: string): Promise<IToken>;

  refreshToken(refreshToken: string): Promise<IToken>;

  obtieneUser(token: string): Promise<IUserSSO>;
}
