import { celebrate, Joi } from 'celebrate';
import cors from 'cors';
import dotenv from 'dotenv';
import { Router } from 'express';
import multer from 'multer';
import protectedRoute from '../middlewares/protectedRoute';
import PayrollController from '../controller/payroll';

dotenv.config();
const route: Router = Router();

// SET STORAGE
const inMemoryStorage: any = multer.memoryStorage();
const uploadStrategy: any = multer({ storage: inMemoryStorage }).single('payrollFile');

export default (app: Router): void => {
  const payrollController: PayrollController = new PayrollController();
  app.use('/payroll', route);

  route.post('/create', cors(), protectedRoute, uploadStrategy, payrollController.createPayroll);

  route.post(
    '/single',
    celebrate({
      body: Joi.object({
        payroll: Joi.any().required(),
        detail: Joi.any().required(),
        beneficiaries: Joi.array().optional()
      })
    }),
    cors(),
    protectedRoute,
    payrollController.addPayroll
  );

  route.get(
    '/history',
    cors(),
    celebrate({
      query: Joi.object({
        codeDate: Joi.string().required(),
        type: Joi.string().optional(),
        page: Joi.string().required(),
        limit: Joi.string().required(),
        contractorRut: Joi.string().required(),
        insuredRut: Joi.string().optional()
      })
    }),
    protectedRoute,
    payrollController.getHistoryPayrollData
  );

  route.get(
    '/file',
    cors(),
    celebrate({
      query: Joi.object({
        payrollFileId: Joi.string().required()
      })
    }),
    protectedRoute,
    payrollController.downloadPayrollFile
  );

  route.get(
    '/validateContractorRut',
    cors(),
    protectedRoute,
    celebrate({
      query: Joi.object({
        insuredRut: Joi.string().required(),
        contractorRut: Joi.string().required()
      })
    }),
    payrollController.validateContractorInsuredRut
  );
};
