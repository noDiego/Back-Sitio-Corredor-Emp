import dotenv from 'dotenv';
import { Router } from 'express';
import protectedRoute from '../middlewares/protectedRoute';
import cors from 'cors';
import HoldingController from '../controller/holding';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  const holdingController: HoldingController = new HoldingController();
  app.use('/holding', route);

  route.get('/', cors(), protectedRoute, holdingController.getHolding);
};
