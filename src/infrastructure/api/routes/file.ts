import { celebrate, Joi } from 'celebrate';
import cors from 'cors';
import dotenv from 'dotenv';
import { Router } from 'express';
import multer from 'multer';
import protectedRoute from '../middlewares/protectedRoute';
import FileController from '../controller/file';

dotenv.config();
const route: Router = Router();
// SET STORAGE
const inMemoryStorage: any = multer.memoryStorage();
const uploadStrategy: any = multer({ storage: inMemoryStorage }).single('denounceApplicationFile');

export default (app: Router): void => {
  const fileController: FileController = new FileController();
  app.use('/file', route);

  route.get(
    ['/downloadToken'],
    cors(),
    celebrate({
      query: Joi.object({
        token: Joi.string().required()
      })
    }),
    protectedRoute,
    fileController.getFile
  );

  route.get(
    '/insured/certificated',
    cors(),
    celebrate({
      query: Joi.object({
        policyNumber: Joi.string().required(),
        insuredId: Joi.string().required(),
        productId: Joi.string().required()
      })
    }),
    protectedRoute,
    fileController.getProductCerticated
  );

  route.get(
    ['/policy/plan/coverage', '/insured/plan/coverage'],
    cors(),
    celebrate({
      query: Joi.object({
        downloadToken: Joi.string().required()
      })
    }),
    protectedRoute,
    fileController.getFileCoverage
  );

  route.get(
    '/policy/contract',
    cors(),
    celebrate({
      query: Joi.object({
        downloadToken: Joi.string().required()
      })
    }),
    protectedRoute,
    fileController.getPolicyContract
  );

  route.get(
    '/insureds',
    protectedRoute,
    celebrate({
      query: Joi.object({
        policyNumber: Joi.string().required()
      })
    }),
    cors(),
    fileController.generateXLSNomina
  );

  route.post('/denounce', cors(), protectedRoute, uploadStrategy, fileController.createDenounceFile);

  route.get(
    '/denounce',
    cors(),
    celebrate({
      query: Joi.object({
        denounceFileId: Joi.string().required()
      })
    }),
    protectedRoute,
    fileController.downloadDenounceFile
  );

  route.delete(
    '/denounce',
    cors(),
    celebrate({
      query: Joi.object({
        denounceFileId: Joi.string().required()
      })
    }),
    protectedRoute,
    fileController.deleteDenounceFile
  );

  route.get(
    '/payroll',
    cors(),
    celebrate({
      query: Joi.object({
        payrollId: Joi.string().required(),
        detail: Joi.string().required()
      })
    }),
    protectedRoute,
    fileController.downloadPayrollFile
  );

  route.post(
    '/collection/reports',
    cors(),
    celebrate({
      body: Joi.object({
        reports: Joi.array().required()
      })
    }),
    protectedRoute,
    fileController.downloadCollectionReports
  );

  route.get(
    '/prescription',
    cors(),
    celebrate({
      query: Joi.object({
        policyNumber: Joi.number().required(),
        insuredRut: Joi.number().required(),
        requestNumber: Joi.string().required()
      })
    }),
    protectedRoute,
    fileController.generatePrescriptionDocument
  );
};
