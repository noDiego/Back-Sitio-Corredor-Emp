import { celebrate, Joi } from 'celebrate';
import dotenv from 'dotenv';
import { Router } from 'express';
import cors from 'cors';
import AuthController from '../controller/auth';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  const authController: AuthController = new AuthController();
  app.use('/', route);

  route.post(
    '/refresh',
    cors(),
    celebrate({
      body: Joi.object({
        refreshToken: Joi.string().required()
      })
    }),
    authController.refreshToken
  );

  route.post(
    '/auth',
    cors(),
    celebrate({
      body: Joi.object({
        redirectUri: Joi.string().required()
      }),
      headers: Joi.object({
        'auth-code': Joi.string().required()
      }).unknown()
    }),
    authController.login
  );
};
