import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import PayrollService from '../../../application/services/payrollService';
import { IPayrollDetailDTO, IPayrollDTO } from '../../../domain/interfaces/dto/v1/IPayroll';
import { PAYROLL_TYPE } from '../../../constants/types';
import PolicyService from '../../../application/services/policyService';
import { trackRequest } from '../../../loaders/insight';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';

export default class PayrollController {
  public async createPayroll(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const payrollService: PayrollService = Container.get(PayrollService);
      const payrollRequest: IPayrollDTO = {
        type: PAYROLL_TYPE[req.body.type],
        typeDescription: req.body.typeDescription as string,
        exclusionType: req.body.exclusionType as string,
        policy: +req.body.policy,
        contractorRut: req.body.contractorRut as string,
        contractorName: req.body.contractorName as string,
        subsidiaryRut: req.body.subsidiaryRut as string,
        subsidiaryName: req.body.subsidiaryName as string,
        subsidiaryCode: req.body.subsidiaryCode as number,
        plan: req.body.plan as string,
        planCode: req.body.planCode as string,
        group: req.body.group as string,
        groupName: req.body.groupName as string,
        capitalRequired: (req.body.requiresCapital as string) == 'true',
        incomeRequired: (req.body.requiresRent as string) == 'true'
      };

      const response: IResponseDTO = await payrollService.createPayroll(req.file, payrollRequest, req.currentUser);
      trackRequest(req, 200, response, true);
      return res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  }

  public async addPayroll(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const payrollService: PayrollService = Container.get(PayrollService);
      const beneficiaries: string[] = req.body.beneficiaries;
      const payroll: IPayrollDTO = req.body.payroll;
      const payrollDetail: IPayrollDetailDTO = req.body.detail;
      payrollDetail.birthday = req.body.detail.birthday ? new Date(req.body.detail.birthday) : undefined;
      payrollDetail.initDate = req.body.detail.initDate ? new Date(req.body.detail.initDate) : undefined;
      payrollDetail.endDate = req.body.detail.endDate ? new Date(req.body.detail.endDate) : undefined;
      payrollDetail.contractDate = req.body.detail.contractDate ? new Date(req.body.detail.contractDate) : undefined;

      const response: IResponseDTO = await payrollService.addPayroll(
        payroll,
        payrollDetail,
        beneficiaries,
        req.currentUser
      );

      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async getHistoryPayrollData(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const payrollService: PayrollService = Container.get(PayrollService);
      const response: IResponseDTO = await payrollService.getHistoryPayrollData(
        +req.query.codeDate,
        req.query.type as string,
        +req.query.page,
        +req.query.limit,
        req.query.contractorRut as string,
        req.query.insuredRut as string
      );
      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async downloadPayrollFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payrollService: PayrollService = Container.get(PayrollService);
      const response: IResponseDTO = await payrollService.downloadPayrollFile(
        +req.query.payrollFileId,
        req.currentUser
      );
      res.writeHead(200, {
        Accept: response.data.fileMimeType
      });

      trackRequest(req, 200, '<File>', true);
      res.end(response.data.buffer);
    } catch (error) {
      next(error);
    }
  }

  public async validateContractorInsuredRut(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const policyService: PolicyService = Container.get(PolicyService);
      const policies: IResponseDTO = await policyService.validateContractorInsuredRut(
        String(req.query.insuredRut),
        String(req.query.contractorRut),
        req.currentUser
      );

      trackRequest(req, 200, policies, true);
      return res.status(200).json(policies);
    } catch (e) {
      next(e);
    }
  }
}
