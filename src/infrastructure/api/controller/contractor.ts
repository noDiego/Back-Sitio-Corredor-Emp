import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import PolicyService from '../../../application/services/policyService';
import InsuredService from '../../../application/services/insuredService';
import { trackRequest } from '../../../loaders/insight';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import { IContractor } from '../../../domain/interfaces/dto/v3/IContractor';

export default class ContractorController {
  public async getContractors(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const policyService: PolicyService = Container.get(PolicyService);
      const response: IResponseDTO = await policyService.getContractors(
        Number(req.query.page),
        Number(req.query.limit),
        req.query.search ? String(req.query.search) : undefined,
        req.query.onlyBlocked == 'true',
        req.query.withRequirements == 'true',
        req.currentUser
      );
      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  public async getContractor(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const policyService: PolicyService = Container.get(PolicyService);
      const response: IContractor = await policyService.getContractor(
        req.query.rutContractor as string,
        req.currentUser
      );
      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  public async getInsurabilityRequirements(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const insuredService: InsuredService = Container.get(InsuredService);
      const rutContractor: string = req.query.rutContractor as string;
      const result: IResponseDTO = await insuredService.getInsurabilityRequirements(
        rutContractor,
        Number(req.query.page),
        Number(req.query.limit),
        req.query.data ? String(req.query.data) : undefined,
        req.currentUser
      );
      const statusResponse: number = result.code === 0 ? 200 : 400;
      trackRequest(req, statusResponse, result, true);
      return res.status(statusResponse).json(result);
    } catch (e) {
      next(e);
    }
  }
}
