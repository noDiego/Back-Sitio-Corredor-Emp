import { Container } from 'typedi';
import { Logger as LoggerType } from 'winston';
import { NextFunction, Request, Response } from 'express';
import logger, { getOperationID } from '../../../loaders/logger';
import SsoService from '../../../application/services/ssoService';
import NodeClient from 'applicationinsights/out/Library/NodeClient';
import { IUserSSO } from '../../../domain/interfaces/dto/v3/IUserSSO';
import Utils from '../../../utils/utils';
import rutjs from 'rut.js';

export async function returnUnauthorizedAccess(res: Response): Promise<void | Response> {
  const insightClient: NodeClient = Container.get('InsightClient');
  logger.error('Unauthorized Access');
  insightClient.trackEvent({ name: 'Unauthorized Access', properties: { message: 'Invalid Auth-Token' } });
  return res.status(401).json({ message: 'unauthorizedAccess' });
}

export default async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  const Logger: LoggerType = Container.get('logger');
  const ssoService: SsoService = Container.get(SsoService);
  const insightClient: NodeClient = Container.get('InsightClient');

  insightClient.trackNodeHttpRequest({ request: req, response: res });

  try {
    const token: string = req.header('Auth-Token');
    if (!token) return returnUnauthorizedAccess(res);

    req.startTime = Date.now();

    const userRecord: IUserSSO = await ssoService.obtieneUser(token);
    if (!userRecord) return returnUnauthorizedAccess(res);
    userRecord.transactionID = generateTransactionID(userRecord.preferredUsername, req.baseUrl);
    userRecord.operationID = getOperationID().replace(/[\[\]\s]/g, '');
    req.currentUser = userRecord;

    Container.set('UserSSO', userRecord);
    return next();
  } catch (e) {
    insightClient.trackException({ exception: e });
    Logger.error('Error attaching user to req: ' + e.message);
    return returnUnauthorizedAccess(res);
  }
};

function generateTransactionID(rut: string, url: string): string {
  return rutjs.clean(rut) + '|' + Utils.stringToBase64(url) + '|' + new Date().getTime();
}
