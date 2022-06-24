import { NextFunction, Request, Response } from 'express';
import { IDenounceApplicationDTO } from 'domain/interfaces/dto/v1/IDenounceApplication';
import { Container } from 'typedi';
import { IDenounceSearchRequestDTO, IDenounceDTO } from '../../../domain/interfaces/dto/v1/IDenounce';
import DenounceService from '../../../application/services/denounceService';
import PolicyService from '../../../application/services/policyService';
import { trackRequest } from '../../../loaders/insight';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import * as exceljs from 'exceljs';

export default class DenounceController {
  public async searchInsuredDenounces(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const denounces: IResponseDTO = await denounceService.searchInsuredDenounces(
        +req.query.policy,
        req.query.rut as string,
        +req.query.dateCode,
        +req.query.page,
        +req.query.limit,
        req.currentUser
      );
      trackRequest(req, 200, denounces, true);
      return res.status(200).json(denounces);
    } catch (e) {
      next(e);
    }
  }

  public async findDenounce(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const denounce: IDenounceDTO = await denounceService.findDenounce(+req.query.applicationNumber, req.currentUser);
      trackRequest(req, 200, denounce, true);
      return res.status(200).json(denounce);
    } catch (e) {
      next(e);
    }
  }

  public async getDenounceApplicationForm(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const denounce: IResponseDTO = await denounceService.getDenounceApplicationForm(
        req.query.insuredRut as string,
        +req.query.policyNumber,
        req.currentUser
      );

      trackRequest(req, 200, denounce, true);
      return res.status(200).json(denounce);
    } catch (e) {
      next(e);
    }
  }

  public async createDenounceApplication(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const inputData: IDenounceApplicationDTO = req.body as IDenounceApplicationDTO;
      inputData.userRut = req.currentUser.preferredUsername;
      const denounce: IDenounceApplicationDTO = await denounceService.createDenounceApplication(
        inputData,
        req.currentUser
      );

      trackRequest(req, 200, denounce, true);
      return res.status(200).json(denounce);
    } catch (e) {
      next(e);
    }
  }

  // route.get('/application', cors(), protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const denounceService = Container.get(DenounceService);
  //     const denounces = await denounceService.getDenouncesApplications();
  //     return res.status(200).json(denounces);
  //   } catch (e) {
  //     next(e);
  //   }
  // });

  public async deleteDenounceApplication(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const response: IResponseDTO = await denounceService.deleteDenounceApplication(
        Number(req.query.id),
        req.currentUser.preferredUsername
      );
      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  // route.get('/file/list', cors(), protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const denounceService = Container.get(DenounceService);
  //     const denouncesFileList = await denounceService.getDenounceAppFileList();
  //     return res.status(200).json(denouncesFileList);
  //   } catch (e) {
  //     next(e);
  //   }
  // });

  public async searchDenounces(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const denounceParam: IDenounceSearchRequestDTO = {
        consignment: req.query.consignment as string,
        applicationNumber: +req.query.applicationNumber,
        policy: +req.query.policy,
        insuredRut: req.query.insuredRut as string,
        contractorRut: req.query.contractorRut as string,
        codeDate: +req.query.codeDate,
        status: req.query.status as string,
        onlyMine: (req.query.onlyMine as string) == 'true',
        page: +req.query.page,
        limit: +req.query.limit
      };

      const denounces: IResponseDTO = await denounceService.searchDenounces(
        req.currentUser,
        req.query.data as string,
        denounceParam
      );
      trackRequest(req, 200, denounces, true);
      return res.status(200).json(denounces);
    } catch (e) {
      next(e);
    }
  }

  public async generateXLSDenounce(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileName: string = 'Denuncio_' + req.query.codeDate + '.xls';
      const denounceService: DenounceService = Container.get(DenounceService);
      const denounceParam: IDenounceSearchRequestDTO = {
        consignment: req.query.consignment as string,
        applicationNumber: +req.query.applicationNumber,
        policy: +req.query.policy,
        insuredRut: req.query.insuredRut as string,
        contractorRut: req.query.contractorRut as string,
        codeDate: +req.query.codeDate,
        status: req.query.status as string,
        onlyMine: (req.query.onlyMine as string) == 'true'
      };

      const excelDenounces: exceljs.Buffer = await denounceService.generateXLSDenounce(req.currentUser, denounceParam);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=' + fileName,
        'Content-Length': excelDenounces.byteLength
      });
      trackRequest(req, 200, '<File>', true);
      res.end(excelDenounces);
    } catch (e) {
      next(e);
    }
  }

  public async searchHealthPolicies(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const policyService: PolicyService = Container.get(PolicyService);
      const denounces: IResponseDTO = await policyService.searchHealthPolicies(req.currentUser);

      trackRequest(req, 200, denounces, true);
      return res.status(200).json(denounces);
    } catch (e) {
      next(e);
    }
  }

  public async searchPaymentDenounceData(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const denouncesPaymentData: IResponseDTO = await denounceService.getPolicyPaymentDetail(
        +req.query.policy,
        req.currentUser
      );

      trackRequest(req, 200, denouncesPaymentData, true);
      return res.status(200).json(denouncesPaymentData);
    } catch (e) {
      next(e);
    }
  }

  public async createDenounceApplicationList(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const inputList: IDenounceApplicationDTO[] = req.body as IDenounceApplicationDTO[];
      const denounce: IDenounceApplicationDTO[] = await denounceService.createDenounceApplicationList(
        inputList,
        req.currentUser
      );
      trackRequest(req, 200, denounce, true);
      return res.status(200).json(denounce);
    } catch (e) {
      next(e);
    }
  }

  public async deleteDenounceApplicationList(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const inputList: number[] = req.body as number[];
      const response: IResponseDTO = await denounceService.deleteDenounceApplicationList(
        inputList,
        req.currentUser.preferredUsername
      );
      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  public async findDenounceFiles(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const denounce: IResponseDTO = await denounceService.findDenounceFiles(
        +req.query.applicationNumber,
        req.currentUser
      );
      trackRequest(req, 200, denounce, true);
      return res.status(200).json(denounce);
    } catch (e) {
      next(e);
    }
  }

  public async getLastDenounceDate(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const denounceService: DenounceService = Container.get(DenounceService);
      const denounce: IResponseDTO = await denounceService.getLastDenounceDate(
        req.query.insuredRut as string,
        req.query.companyRut as string,
        req.query.policyNumber ? +req.query.policyNumber : null,
        req.currentUser
      );
      trackRequest(req, 200, denounce, true);
      return res.status(200).json(denounce);
    } catch (e) {
      next(e);
    }
  }
}
