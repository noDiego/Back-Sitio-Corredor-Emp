import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import HoldingService from '../../../application/services/holdingService';
import { trackRequest } from '../../../loaders/insight';
import { IHoldingDTO } from '../../../domain/interfaces/dto/v1/IHolding';

export default class HoldingController {
  //TODO: ELIMINAR
  public async getHolding(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const holdingService: HoldingService = Container.get(HoldingService);
      const holdings: IHoldingDTO[] = await holdingService.getHolding(req.currentUser);
      trackRequest(req, 200, { data: holdings }, true);
      return res.status(200).json({ data: holdings });
    } catch (e) {
      next(e);
    }
  }
}
