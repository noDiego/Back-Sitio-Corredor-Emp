import dotenv from 'dotenv';
import { Router } from 'express';
import middlewares from '../middlewares';
import cors from 'cors';
import ProfileController from '../controller/profile';
import protectedRoute from '../middlewares/protectedRoute';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  const profileController: ProfileController = new ProfileController();
  app.use('/', route);

  route.get('/holamundo', protectedRoute, profileController.test);
  route.get('/test', protectedRoute, profileController.testController);
  route.post('/holamundo', protectedRoute, profileController.test);

  route.get('/profile', cors(), middlewares.protectedRoute, profileController.getProfile);
};
