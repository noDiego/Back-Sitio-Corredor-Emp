import dotenv from 'dotenv';
import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import protectedRoute from '../middlewares/protectedRoute';
import cors from 'cors';
import InsuredController from '../controller/insured';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  const insuredController: InsuredController = new InsuredController();
  app.use('/insured', route);

  route.get(
    '/file',
    cors(),
    celebrate({
      query: Joi.object({
        rut: Joi.string().required(),
        policy: Joi.string().required()
      })
    }),
    protectedRoute,
    insuredController.getInsuredFile
  );

  route.get(
    '/search',
    cors(),
    celebrate({
      query: Joi.object({
        data: Joi.string().required(),
        page: Joi.string().required(),
        limit: Joi.string().required()
      })
    }),
    protectedRoute,
    insuredController.searchInsured
  );

  route.put(
    '/profile',
    cors(),
    celebrate({
      body: Joi.object({
        allPolicies: Joi.string(),
        policyNumber: Joi.string().required(),
        rut: Joi.string().required()
      }).unknown()
    }),
    protectedRoute,
    insuredController.updateInfo
  );

  route.get(
    '/deductible',
    cors(),
    celebrate({
      query: Joi.object({
        contractorRut: Joi.string().required(),
        insuredRut: Joi.string().required(),
        policy: Joi.string().required()
      })
    }),
    protectedRoute,
    insuredController.getInsuredDeductible
  );

  route.get(
    '/insuredRequirement',
    cors(),
    protectedRoute,
    celebrate({
      query: Joi.object({
        insuredRut: Joi.string().required(),
        policyNumber: Joi.number().required()
      })
    }),
    insuredController.getInsurabilityRequirement
  );

  route.get(
    '/prescriptions',
    cors(),
    protectedRoute,
    celebrate({
      query: Joi.object({
        insuredRut: Joi.string().required(),
        policyNumber: Joi.string().required(),
        page: Joi.string().required(),
        limit: Joi.string().required()
      })
    }),
    insuredController.getPrescriptions
  );
};
