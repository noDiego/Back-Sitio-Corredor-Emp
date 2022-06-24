import { Container, Inject, Service } from 'typedi';
import { IToken } from '../../domain/interfaces/dto/v3/IToken';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import SsoClient from '../../infrastructure/clients/ssoClient';
import { Logger } from 'winston';
import { ISsoService } from '../../domain/interfaces/services/ISsoService';
import moment, { Moment } from 'moment';
import { SsoUser, SsoUserCreation } from '../../infrastructure/clients/dto/sso/ssoUser';
import { IResponseDTO } from '../../domain/interfaces/dto/v1/IResponse';
import { IServiceResponse } from '../../domain/interfaces/dto/v3/IServiceResponse';
import rutjs from 'rut.js';

@Service('SsoService')
export default class SsoService implements ISsoService {
  @Inject('logger') private readonly logger: Logger;
  @Inject('SsoClient') private readonly ssoClient: SsoClient;

  async obtieneToken(authcode: string, redirectUri: string): Promise<IToken> {
    return await this.ssoClient.obtieneToken(authcode, redirectUri);
  }

  async refreshToken(refreshToken: string): Promise<IToken> {
    return await this.ssoClient.refreshToken(refreshToken);
  }

  async obtieneUser(token: string): Promise<IUserSSO> {
    return await this.ssoClient.obtieneUser(token);
  }

  async buscaUser(rut: string, email?: string): Promise<IResponseDTO> {
    const tokenAdmin: IToken = await this.getAdminToken();
    let user: SsoUser;

    if (!rutjs.validate(rut)) {
      return {
        code: 1,
        message: `${rut} no es un rut valido`
      };
    }

    const response: IServiceResponse = await this.ssoClient.searchUser(
      { username: rutjs.format(rut).replace(/\./g, ''), email: email },
      tokenAdmin.accessToken
    );

    if (response.code == 0)
      user = response.data.find((user: SsoUser) => rutjs.format(user.username) == rutjs.format(rut));

    return {
      code: user ? 0 : 1,
      message: user ? 'OK' : `${rut} no existe`,
      data: user
    };
  }

  async crearUser(userData: SsoUserCreation): Promise<IResponseDTO> {
    const tokenAdmin: IToken = await this.getAdminToken();

    const response: IServiceResponse = await this.ssoClient.createUser(userData, tokenAdmin.accessToken);

    return {
      code: response.success ? 0 : 1,
      message: response.message
    };
  }

  async actualizarUser(userData: SsoUserCreation, idUser: string): Promise<IResponseDTO> {
    const tokenAdmin: IToken = await this.getAdminToken();

    const response: IServiceResponse = await this.ssoClient.updateUser(userData, idUser, tokenAdmin.accessToken);

    return {
      code: response.success ? 0 : 1,
      message: response.message
    };
  }

  private async getAdminToken(): Promise<IToken> {
    this.logger.info('Obteniendo AdminToken');
    const sessionToken: IToken = Container.has('SSOAdminToken') ? Container.get('SSOAdminToken') : undefined;
    const actualDate: Moment = moment();
    let newToken: IToken;

    if (sessionToken && moment(sessionToken.expireDate).isAfter(actualDate)) {
      return sessionToken;
    } else if (sessionToken && moment(sessionToken.refreshExpireDate).isAfter(actualDate)) {
      this.logger.info('Token Expirado, obteniendo actualizacion desde SSO');
      console.log(sessionToken.refreshToken);
      newToken = await this.ssoClient.refreshAdminToken(sessionToken.refreshToken);
    } else {
      this.logger.info('Generando nuevo Token desde SSO');
      newToken = await this.ssoClient.getAdminToken();
    }

    newToken.expireDate = actualDate.add(newToken.expiresIn - 5, 'seconds').toDate();
    newToken.refreshExpireDate = actualDate.add(newToken.refreshExpiresIn - 5, 'seconds').toDate();
    Container.set('SSOAdminToken', newToken);
    return newToken;
  }
}
