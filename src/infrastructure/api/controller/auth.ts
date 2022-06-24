import { Request, Response } from 'express';
import { Container } from 'typedi';
import { Logger } from 'winston';
import SsoService from '../../../application/services/ssoService';
import { IToken } from '../../../domain/interfaces/dto/v3/IToken';
import { IUserSSO } from '../../../domain/interfaces/dto/v3/IUserSSO';
import NodeClient from 'applicationinsights/out/Library/NodeClient';
import { trackRequest } from '../../../loaders/insight';

export default class AuthController {
  public async refreshToken(req: Request, res: Response): Promise<Response> {
    const ssoService: SsoService = Container.get(SsoService);
    const resp: IToken = await ssoService.refreshToken(req.body.refreshToken);
    return res.status(200).send(resp);
  }

  public async login(req: Request, res: Response): Promise<Response> {
    const ssoService: SsoService = Container.get(SsoService);
    const logger: Logger = Container.get('logger');
    const client: NodeClient = Container.get('InsightClient');

    client.trackEvent({
      name: 'HttpRequest',
      properties: { headers: { 'auth-code': req.header('auth-code') }, body: req.body }
    });

    try {
      res.header('Content-Type', 'application/json');
      const authCode: string = req.header('auth-code');

      const tokenObject: IToken = await ssoService.obtieneToken(authCode as string, req.body.redirectUri);
      const userData: IUserSSO = await ssoService.obtieneUser(tokenObject.accessToken);
      userData.tokenData = tokenObject;

      if (!tokenObject.accessToken) {
        return res.status(401).send({ message: 'No se pudo autenticar usuario' });
      }

      logger.info('Usuario ' + userData.name + ' ingresa');

      const response: string = JSON.stringify(userData, null, 4);

      trackRequest(req, 200, response, true);
      return res.status(200).send(response);
    } catch (e) {
      // TODO: Manejo de errores
      logger.error(e);
      //client.trackException({ exception: e });
      return res.status(500).send({ message: e.message });
    }
  }
}
