import { celebrate, Joi } from 'celebrate';
import cors from 'cors';
import dotenv from 'dotenv';
import { Router } from 'express';
import protectedRoute from '../middlewares/protectedRoute';
import CommissionController from '../controller/commission';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  const commissionController: CommissionController = new CommissionController();
  app.use('/commission', route);

  route.get('/intermediary', cors(), protectedRoute, commissionController.searchIntermediaryCode);

  route.get(
    '/periods',
    cors(),
    celebrate({
      query: Joi.object({
        intermediaryCode: Joi.string()
      })
    }),
    protectedRoute,
    commissionController.getCommissionPeriods
  );

  route.get(
    '/totals',
    cors(),
    protectedRoute,
    celebrate({
      query: Joi.object({
        period: Joi.string().required(),
        intercode: Joi.string().required()
      })
    }),
    commissionController.getCommissionsTotal
  );
};
