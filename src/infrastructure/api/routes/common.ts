import dotenv from 'dotenv';
import { Router } from 'express';
import cors from 'cors';
import CommonController from '../controller/common';
import protectedRoute from '../middlewares/protectedRoute';

dotenv.config();
const route: Router = Router();

export default (app: Router): void => {
  const commonController: CommonController = new CommonController();
  app.use('/common', route);

  route.get('/regiones', protectedRoute, cors(), commonController.listaRegiones);

  route.get('/bancos', protectedRoute, cors(), commonController.listaBancos);

  route.get('/tipocuenta', protectedRoute, cors(), commonController.tiposCuenta);

  route.get('/previsiones', protectedRoute, cors(), commonController.listaPrevisiones);
};
