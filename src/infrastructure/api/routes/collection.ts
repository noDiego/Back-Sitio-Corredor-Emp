import { celebrate, Joi } from 'celebrate';
import cors from 'cors';
import dotenv from 'dotenv';
import { Router } from 'express';
import protectedRoute from '../middlewares/protectedRoute';
import CollectionController from '../controller/collection';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  const collectionController: CollectionController = new CollectionController();
  app.use('/collection', route);

  route.get(
    '/debt',
    cors(),
    celebrate({
      query: Joi.object({
        companyRut: Joi.string().required(),
        data: Joi.string(),
        page: Joi.string().required(),
        limit: Joi.string().required()
      })
    }),
    protectedRoute,
    collectionController.searchCollectionsPendingDebt
  );

  route.get(
    '/debt/file',
    cors(),
    celebrate({
      query: Joi.object({
        companyRut: Joi.string(),
        data: Joi.string()
      })
    }),
    protectedRoute,
    collectionController.generateExcelInvoices
  );

  route.get(
    '/invoice/file',
    cors(),
    celebrate({
      query: Joi.object({
        invoiceNumber: Joi.number().required(),
        invoiceType: Joi.string().required()
      })
    }),
    protectedRoute,
    collectionController.getInvoice
  );

  route.post(
    '/reports',
    cors(),
    protectedRoute,
    celebrate({
      body: Joi.object({
        period: Joi.string(),
        polices: Joi.array().required(),
        page: Joi.number().required(),
        limit: Joi.number().required()
      })
    }),
    collectionController.getReport
  );

  route.get(
    '/payment/history',
    cors(),
    celebrate({
      query: Joi.object({
        contractorRut: Joi.string().required(),
        dateCode: Joi.string(),
        page: Joi.string().required(),
        limit: Joi.string().required()
      })
    }),
    protectedRoute,
    collectionController.searchPaymentHistory
  );

  route.get(
    '/payment/history/file',
    cors(),
    celebrate({
      query: Joi.object({
        contractorRut: Joi.string().required(),
        dateCode: Joi.string()
      })
    }),
    protectedRoute,
    collectionController.generateExcelPaymentHistory
  );
};
