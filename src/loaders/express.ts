/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Application, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import routes from '../infrastructure/api';
import config from '../config';
import logger from './logger';
import { IError } from '../utils/interfaces/IError';
import { trackRequest } from './insight';

export default (app: Application): void => {
  // const client: NodeClient = Container.get('InsightClient');

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs

  app.enable('trust proxy');

  // Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json());

  // Load API routes
  app.use(config.api.prefix, routes());

  // Convierte datos de formulario
  app.use(express.urlencoded({ extended: true }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const err: Error = new Error('Error 404: Not Found');
    err['status'] = 404;
    next(err);
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode: number;
    let body: any;
    let friendlyError: string;
    if (err.name === 'UnauthorizedError') {
      statusCode = 401;
      body = {
        error: {
          message: 'Unauthorized'
        }
      };
    } else {
      statusCode = err.status || 500;
      if (!!err.httpError)
        friendlyError = err.httpError.userFriendlyError ? err.httpError.userFriendlyError : 'Internal Error';
      else friendlyError = err.message;

      body = {
        error: {
          name: err.name,
          message: friendlyError,
          code: err.code,
          serviceErrorDetail: config.nodeEnv == 'development' ? err.serviceErrorDetail : undefined
        }
      };
    }
    logger.error('Error. URL: ' + req.url + '. Status:' + statusCode + '. MessageBody: ' + JSON.stringify(body));

    trackRequest(req, statusCode, body, false, err);

    return res.status(statusCode).send(body).end();
  });
};
