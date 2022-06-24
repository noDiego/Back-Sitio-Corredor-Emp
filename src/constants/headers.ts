import config from '../config';
import { IUserSSO } from '../domain/interfaces/dto/v3/IUserSSO';

const CONTENTTYPE = 'Content-Type';
const CLIENT = 'x-ibm-client-id';
const APPLICATION = 'x-application';
const AUTHORIZATIONID = 'Authorization';
const TIMESTAMP = 'x-timestamp';
const TRANSACTIONID = 'x-transaction_id';

export function getVSHeaders(user: IUserSSO): Record<string, string> {
  return {
    [CLIENT]: config.serviceClientId,
    [APPLICATION]: config.XApplicationHeader,
    [TIMESTAMP]: new Date().toISOString(),
    [AUTHORIZATIONID]: `Bearer ${user.authorizationToken}`,
    [CONTENTTYPE]: 'application/json',
    [TRANSACTIONID]: user.transactionID
  };
}
