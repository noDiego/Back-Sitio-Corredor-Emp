import dotenv from 'dotenv';
import { Router } from 'express';
import cors from 'cors';
import { celebrate, Joi } from 'celebrate';
import protectedRoute from '../middlewares/protectedRoute';
import ContractorController from '../controller/contractor';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  const contractorController: ContractorController = new ContractorController();
  app.use('/contractors', route);

  route.get(
    '',
    cors(),
    protectedRoute,
    celebrate({
      query: Joi.object({
        page: Joi.number().required(),
        limit: Joi.number().required(),
        search: Joi.string().optional(),
        onlyBlocked: Joi.string().optional(),
        withRequirements: Joi.string().optional()
      })
    }),
    contractorController.getContractors
  );

  route.get(
    '/contractor',
    cors(),
    protectedRoute,
    celebrate({
      query: Joi.object({
        rutContractor: Joi.string().required()
      })
    }),
    contractorController.getContractor
  );

  route.get(
    '/insurabilityRequirements',
    cors(),
    protectedRoute,
    celebrate({
      query: Joi.object({
        rutContractor: Joi.string(),
        data: Joi.string().optional(),
        page: Joi.string().required(),
        limit: Joi.string().required()
      })
    }),
    contractorController.getInsurabilityRequirements
  );
};
