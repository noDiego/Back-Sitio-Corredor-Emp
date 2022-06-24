import { celebrate, Joi } from 'celebrate';
import cors from 'cors';
import dotenv from 'dotenv';
import { Router } from 'express';
import protectedRoute from '../middlewares/protectedRoute';
import DenounceController from '../controller/denounce';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  const denounceController: DenounceController = new DenounceController();
  app.use('/denounce', route);

  route.get(
    '/insured',
    cors(),
    celebrate({
      query: Joi.object({
        policy: Joi.string(),
        rut: Joi.string(),
        dateCode: Joi.string(),
        page: Joi.string().required(),
        limit: Joi.string().required()
      })
    }),
    protectedRoute,
    denounceController.searchInsuredDenounces
  );

  route.get(
    '/file',
    cors(),
    celebrate({
      query: Joi.object({
        applicationNumber: Joi.string()
      })
    }),
    protectedRoute,
    denounceController.findDenounce
  );

  route.get(
    '/form/init',
    cors(),
    celebrate({
      query: Joi.object({
        insuredRut: Joi.string(),
        policyNumber: Joi.string()
      })
    }),
    protectedRoute,
    denounceController.getDenounceApplicationForm
  );

  route.put('/application', cors(), protectedRoute, denounceController.createDenounceApplication);

  // route.get('/application', cors(), protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const denounceService = Container.get(DenounceService);
  //     const denounces = await denounceService.getDenouncesApplications();
  //     return res.status(200).json(denounces);
  //   } catch (e) {
  //     next(e);
  //   }
  // });

  route.delete(
    '/application',
    cors(),
    celebrate({
      query: Joi.object({
        id: Joi.string().required()
      }).unknown()
    }),
    protectedRoute,
    denounceController.deleteDenounceApplication
  );

  // route.get('/file/list', cors(), protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const denounceService = Container.get(DenounceService);
  //     const denouncesFileList = await denounceService.getDenounceAppFileList();
  //     return res.status(200).json(denouncesFileList);
  //   } catch (e) {
  //     next(e);
  //   }
  // });

  route.get(
    '/search',
    cors(),
    celebrate({
      query: Joi.object({
        data: Joi.string(),
        applicationNumber: Joi.string(),
        consignment: Joi.string(),
        policy: Joi.string(),
        insuredRut: Joi.string(),
        contractorRut: Joi.string(),
        codeDate: Joi.string(),
        status: Joi.string(),
        onlyMine: Joi.string(),
        page: Joi.number().required(),
        limit: Joi.number().required()
      })
    }),
    protectedRoute,
    denounceController.searchDenounces
  );

  route.get(
    '/excel',
    cors(),
    celebrate({
      query: Joi.object({
        applicationNumber: Joi.string(),
        consignment: Joi.string(),
        policy: Joi.string(),
        insuredRut: Joi.string(),
        contractorRut: Joi.string(),
        codeDate: Joi.string(),
        status: Joi.string(),
        onlyMine: Joi.string()
      })
    }),
    protectedRoute,
    denounceController.generateXLSDenounce
  );

  route.get('/policies', cors(), protectedRoute, denounceController.searchHealthPolicies);

  route.get(
    '/policy',
    cors(),
    celebrate({
      query: Joi.object({
        policy: Joi.string().required()
      })
    }),
    protectedRoute,
    denounceController.searchPaymentDenounceData
  );

  route.put('/application/list', cors(), protectedRoute, denounceController.createDenounceApplicationList);

  route.delete('/application/list', cors(), protectedRoute, denounceController.deleteDenounceApplicationList);

  route.get(
    '/file/backup/files',
    cors(),
    celebrate({
      query: Joi.object({
        applicationNumber: Joi.string()
      })
    }),
    protectedRoute,
    denounceController.findDenounceFiles
  );

  route.get(
    '/lastDate',
    cors(),
    celebrate({
      query: Joi.object({
        insuredRut: Joi.string().required(),
        companyRut: Joi.string().required(),
        policyNumber: Joi.number().optional()
      })
    }),
    protectedRoute,
    denounceController.getLastDenounceDate
  );
};
