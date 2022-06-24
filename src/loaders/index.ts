import insightLoader from './insight';
import { Container } from 'typedi';
import { Application } from 'express';
import expressLoader from './express';
import Logger from './logger';
import typeORMLoader from './typeORM';
import RedisClient from './redis';
import moment from 'moment';
import NodeClient from 'applicationinsights/out/Library/NodeClient';

export default async function loaderStart(app: Application): Promise<void> {
  const insight: NodeClient = await insightLoader();
  Container.set('InsightClient', insight);
  Logger.info('Insight loaded');

  Container.set('logger', Logger);
  Logger.info('Logger loaded');

  Container.set('RedisClient', RedisClient);
  Logger.info('RedisClient loaded');

  await expressLoader(app);
  Logger.info('Express loaded');

  Logger.info('Creating SQLServer connection');
  try {
    await typeORMLoader();
    Logger.info('DB loaded and connected. ');
  } catch (error) {
    Logger.error('Unable to connect to the database: ' + error.message, error);
  }

  moment.locale('es');
}
