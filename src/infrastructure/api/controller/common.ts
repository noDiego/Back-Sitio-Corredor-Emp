import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import CommonService from '../../../application/services/commonService';
import { ILocalidad } from '../../../domain/interfaces/dto/v1/ILocalidad';
import { ICodeObject } from '../../../domain/interfaces/dto/v3/ICodeObject';
import { trackRequest } from '../../../loaders/insight';

export default class CommonController {
  public async listaRegiones(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const commonService: CommonService = Container.get(CommonService);
      const regiones: ILocalidad[] = await commonService.listaRegiones(req.currentUser);
      trackRequest(req, 200, regiones, true);
      return res.status(200).json(regiones);
    } catch (e) {
      next(e);
    }
  }

  public async listaBancos(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const commonService: CommonService = Container.get(CommonService);
      const bancos: ICodeObject[] = await commonService.listaBancos(req.currentUser);
      trackRequest(req, 200, bancos, true);
      return res.status(200).json(bancos);
    } catch (e) {
      next(e);
    }
  }

  public async tiposCuenta(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const commonService: CommonService = Container.get(CommonService);
      const tipoCuenta: ICodeObject[] = await commonService.tiposCuenta(req.currentUser);
      trackRequest(req, 200, tipoCuenta, true);
      return res.status(200).json(tipoCuenta);
    } catch (e) {
      next(e);
    }
  }

  public async listaPrevisiones(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const commonService: CommonService = Container.get(CommonService);
      const previsiones: ICodeObject[] = await commonService.listaPrevisiones(req.currentUser);
      trackRequest(req, 200, previsiones, true);
      return res.status(200).json(previsiones);
    } catch (e) {
      next(e);
    }
  }
}
