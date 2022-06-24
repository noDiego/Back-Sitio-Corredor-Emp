import { NextFunction, Request, Response } from 'express';
import PolicyService from '../../../application/services/policyService';
import { Container } from 'typedi';
import { trackRequest } from '../../../loaders/insight';
import { IPolicyV1 } from '../../../domain/interfaces/dto/v1/IPolicy';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import { IPagedResponse } from '../../../domain/interfaces/dto/v1/IResponse';
import { IInsuredV2 } from '../../../domain/interfaces/dto/v2/IInsured';

export default class PolicyController {
  public async getPolicyFile(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const polizaService: PolicyService = Container.get(PolicyService);
      const polizas: IPolicyV1 = await polizaService.getPolicyFile(+req.query.id, req.currentUser);
      trackRequest(req, 200, polizas, true);
      return res.status(200).json(polizas);
    } catch (e) {
      next(e);
    }
  }
  public async getPlanDetail(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const polizaService: PolicyService = Container.get(PolicyService);
      const polizas: IResponseDTO = await polizaService.getPlanDetail(
        +req.query.renewalId,
        +req.query.planCode,
        req.currentUser
      );
      trackRequest(req, 200, polizas, true);
      return res.status(200).json(polizas);
    } catch (e) {
      next(e);
    }
  }

  public async searchPolicies(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const polizaService: PolicyService = Container.get(PolicyService);
      const polizas: IResponseDTO = await polizaService.searchPolicies(
        req.query.data as string,
        +req.query.page,
        +req.query.limit,
        req.currentUser
      );
      trackRequest(req, 200, polizas, true);
      return res.status(200).json(polizas);
    } catch (e) {
      next(e);
    }
  }

  public async getInsuredList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const polizaService: PolicyService = Container.get(PolicyService);
      await polizaService.validatePolicePermission(Number(req.query.policy), req.currentUser);

      const insureds: IPagedResponse<IInsuredV2> = await polizaService.getInsuredList(
        req.query.data as string,
        Number(req.query.policy),
        Number(req.query.page),
        Number(req.query.limit),
        req.currentUser
      );
      trackRequest(req, 200, insureds, true);
      return res.status(200).json(insureds).end();
    } catch (e) {
      next(e);
    }
  }
}
