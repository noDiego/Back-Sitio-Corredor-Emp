import express, { Express } from 'express';
import config from './config';
import logger from './loaders/logger';
import 'reflect-metadata';
import loaderStart from './loaders';

async function startServer(): Promise<void> {
  const app: Express = express();

  await import('./loaders');
  await loaderStart(app);

  app.listen(config.port, (err: Error) => {
    if (err) {
      logger.error(`Error starting app: ${err.message}`, err);
      process.exit(1);
    }
    logger.info(`Server listening on port: ${config.port}`);
  });
}

startServer();
