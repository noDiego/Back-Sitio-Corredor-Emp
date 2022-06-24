import { Router } from 'express';
import dotenv from 'dotenv';
import { celebrate, Joi } from 'celebrate';
import cors from 'cors';
import AdministrationController from '../controller/administration';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  app.use('/admin', route);

  const administrationController: AdministrationController = new AdministrationController();

  route.post(
    '/user',
    celebrate({
      body: Joi.object({
        rut: Joi.string().required()
      }).unknown()
    }),
    administrationController.insertUser
  );

  route.get(
    '/user',
    celebrate({
      query: Joi.object({
        rut: Joi.string().required()
      })
    }),
    administrationController.getUserData
  );

  route.delete(
    '/user',
    celebrate({
      body: Joi.object({
        rut: Joi.string().required()
      })
    }),
    administrationController.deleteUser
  );

  route.put(
    '/user',
    celebrate({
      body: Joi.object({
        rut: Joi.string().required()
      }).unknown()
    }),
    administrationController.updateUser
  );

  route.post('/profile', cors(), administrationController.insertProfile);

  route.get('/profile', cors(), administrationController.getProfiles);

  route.delete('/profile', cors(), administrationController.deleteProfile);

  route.put('/profile', cors(), administrationController.updateProfile);

  route.post('/functionality', cors(), administrationController.insertFunctionality);

  route.get('/functionality', cors(), administrationController.getFunctionalities);

  route.delete('/functionality', cors(), administrationController.deleteFunctionality);

  route.put(
    '/functionality',
    celebrate({
      body: Joi.object({
        code: Joi.string().required(),
        description: Joi.string().required(),
        status: Joi.number().required()
      })
    }),
    administrationController.updateFunctionality
  );
};
