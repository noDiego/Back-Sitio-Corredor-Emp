import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import InsuredService from '../../../application/services/insuredService';
import { InsuredEdition } from '../../../domain/interfaces/dto/v3/IInsured';
import { trackRequest } from '../../../loaders/insight';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';

export default class InsuredController {
  public async getInsuredFile(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const insuredService: InsuredService = Container.get(InsuredService);
      const response: IResponseDTO = await insuredService.getInsuredFile(
        req.query.rut as string,
        req.query.policy as string,
        req.currentUser
      );
      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  public async searchInsured(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const insuredService: InsuredService = Container.get(InsuredService);
      const fichasAsegurado: IResponseDTO = await insuredService.searchInsured(
        req.query.data as string,
        +req.query.page,
        +req.query.limit,
        req.currentUser
      );
      trackRequest(req, 200, fichasAsegurado, true);
      return res.status(200).json(fichasAsegurado);
    } catch (e) {
      next(e);
    }
  }

  public async updateInfo(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const insuredService: InsuredService = Container.get(InsuredService);
      const inputData: InsuredEdition = req.body as InsuredEdition;
      const result: IResponseDTO = await insuredService.updateInfo(inputData, req.currentUser);
      trackRequest(req, result.code > 1 ? 400 : 200, result, true);
      return res.status(result.code > 1 ? 400 : 200).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async getInsuredDeductible(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const insuredService: InsuredService = Container.get(InsuredService);
      const response: IResponseDTO = await insuredService.getInsuredDeductible(
        req.query.contractorRut as string,
        req.query.insuredRut as string,
        req.query.policy as string,
        req.currentUser
      );

      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  public async getInsurabilityRequirement(req: Request, res: Response): Promise<Response> {
    const insuredService: InsuredService = Container.get(InsuredService);
    const insuredRut: string = req.query.insuredRut as string;
    const policyNumber = Number(req.query.policyNumber);
    const result: IResponseDTO = await insuredService.getInsurabilityRequirement(
      insuredRut,
      policyNumber,
      req.currentUser
    );
    trackRequest(req, result.code > 1 ? 400 : 200, result, true);
    return res.status(result.code > 1 ? 400 : 200).json(result);
  }

  public async getPrescriptions(req: Request, res: Response): Promise<Response> {
    const insuredService: InsuredService = Container.get(InsuredService);
    const insuredRut: string = req.query.insuredRut as string;
    const policyNumber = Number(req.query.policyNumber);
    const result: IResponseDTO = await insuredService.getPrescriptions(
      insuredRut,
      policyNumber,
      +req.query.page,
      +req.query.limit,
      req.currentUser
    );
    trackRequest(req, result.code > 1 ? 400 : 200, result, true);
    return res.status(result.code > 1 ? 400 : 200).json(result);
  }
}
