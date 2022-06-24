import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { trackRequest } from '../../../loaders/insight';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import CommissionService from '../../../application/services/commissionService';

export default class CommissionController {
  public async searchIntermediaryCode(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const commissionService: CommissionService = Container.get(CommissionService);
      const intermediaryCodes: IResponseDTO = await commissionService.searchIntermediaryCode(req.currentUser);
      trackRequest(req, 200, intermediaryCodes, true);
      return res.status(200).json(intermediaryCodes);
    } catch (e) {
      next(e);
    }
  }

  public async getCommissionPeriods(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const commissionService: CommissionService = Container.get(CommissionService);
      const periods: IResponseDTO = await commissionService.searchCommissionPeriods(
        req.query.intermediaryCode as string,
        req.currentUser
      );
      trackRequest(req, 200, periods, true);
      return res.status(200).json(periods);
    } catch (e) {
      next(e);
    }
  }

  public async getCommissionsTotal(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const commissionService: CommissionService = Container.get(CommissionService);
      const commissionTotals: IResponseDTO = await commissionService.searchCommissionsTotal(
        req.query.intermediaryCode as string,
        Number(req.query.period),
        req.currentUser
      );
      trackRequest(req, 200, commissionTotals, true);
      return res.status(200).json(commissionTotals);
    } catch (e) {
      next(e);
    }
  }
}
