import dotenv from 'dotenv';
import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import protectedRoute from '../middlewares/protectedRoute';
import cors from 'cors';
import PolicyController from '../controller/policy';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  const policyController: PolicyController = new PolicyController();
  app.use('/policy', route);

  route.get(
    '/file',
    cors(),
    celebrate({
      query: Joi.object({
        id: Joi.string().required()
      })
    }),
    protectedRoute,
    policyController.getPolicyFile
  );

  route.get(
    '/plan',
    cors(),
    celebrate({
      query: Joi.object({
        renewalId: Joi.string().required(),
        planCode: Joi.string().required()
      })
    }),
    protectedRoute,
    policyController.getPlanDetail
  );

  route.get(
    '/search',
    cors(),
    celebrate({
      query: Joi.object({
        data: Joi.string().required(),
        page: Joi.number().required(),
        limit: Joi.number().required()
      })
    }),
    protectedRoute,
    policyController.searchPolicies
  );

  route.get(
    '/insureds',
    cors(),
    celebrate({
      query: Joi.object({
        data: Joi.string(),
        policy: Joi.number().required(),
        page: Joi.number().required(),
        limit: Joi.number().required()
      })
    }),
    protectedRoute,
    policyController.getInsuredList
  );
};
