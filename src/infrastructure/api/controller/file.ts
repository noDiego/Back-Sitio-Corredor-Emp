import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import FileService from '../../../application/services/fileService';
import InsuredService from '../../../application/services/insuredService';
import { IReportDetail } from '../../../domain/interfaces/dto/v1/ICollectionReport';
import { IResponseDTO, IResponseFileDTO } from '../../../utils/interfaces/IResponse';
import { IFileService } from '../../../domain/interfaces/services/IFileService';
import { trackRequest } from '../../../loaders/insight';
import * as exceljs from 'exceljs';
import { IDenounceFileDTO } from '../../../domain/interfaces/dto/v1/IDenounceFile';
import { IPayrollDTO } from '../../../domain/interfaces/dto/v1/IPayroll';
import PolicyService from '../../../application/services/policyService';

export default class FileController {
  public async getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileService: IFileService = Container.get<FileService>('FileService');
      const archivo: IResponseFileDTO = await fileService.getFile(
        req.query.token == 'token' ? 0 : +req.query.token,
        req.currentUser
      );

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=' + 'fileName',
        'Content-Length': archivo.file.length
      });
      trackRequest(req, 200, '<File>', true);
      res.end(archivo.file);
    } catch (e) {
      next(e);
    }
  }

  public async getProductCerticated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileService: FileService = Container.get<FileService>('FileService');
      const archivoCertificado: Buffer = await fileService.getProductCerticated(
        +req.query.policyNumber,
        req.query.insuredId as string,
        +req.query.productId,
        req.currentUser
      );

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=Certificado Cobertura_' + req.query.productId + '.pdf',
        'Content-Length': archivoCertificado.length
      });
      trackRequest(req, 200, '<File>', true);
      res.end(archivoCertificado);
    } catch (e) {
      next(e);
    }
  }

  public async getFileCoverage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileName: string = 'Plan de Cobertura de Poliza_' + req.query.downloadToken + '.pdf';
      const fileService: FileService = Container.get<FileService>('FileService');
      const archivoCertificado: IResponseFileDTO = await fileService.getFile(+req.query.downloadToken, req.currentUser);

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=' + fileName,
        'Content-Length': archivoCertificado.file.length
      });
      trackRequest(req, 200, '<File>', true);
      res.end(archivoCertificado.file);
    } catch (e) {
      next(e);
    }
  }

  public async getPolicyContract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileName: string = 'N° Póliza_' + req.query.downloadToken + '.pdf';
      const fileService: FileService = Container.get<FileService>('FileService');
      const archivoCertificado: Buffer = await fileService.getPolicyContract(+req.query.downloadToken, req.currentUser);

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=' + fileName,
        'Content-Length': archivoCertificado.length
      });
      trackRequest(req, 200, '<File>', true);
      res.end(archivoCertificado);
    } catch (e) {
      next(e);
    }
  }

  public async generateXLSNomina(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileName: string = 'Asegurados_' + req.query.policyNumber + '.pdf';
      const insuredService: InsuredService = Container.get(InsuredService);
      const policyService: PolicyService = Container.get(PolicyService);

      await policyService.validatePolicePermission(Number(req.query.policyNumber), req.currentUser);
      const excelInsureds: exceljs.Buffer = await insuredService.generateXLSNomina(
        +req.query.policyNumber,
        req.currentUser
      );

      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=' + fileName,
        'Content-Length': excelInsureds.byteLength
      });
      trackRequest(req, 200, '<File>', true);
      res.end(excelInsureds);
    } catch (e) {
      next(e);
    }
  }

  public async createDenounceFile(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const fileService: FileService = Container.get(FileService);
      const response: IResponseDTO = await fileService.createDenounceFile(req.file, Number(req.body.denounceId));
      trackRequest(req, 200, response, true);
      return res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  }

  public async downloadDenounceFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileService: FileService = Container.get(FileService);
      const response: IDenounceFileDTO = await fileService.downloadDenounceFile(
        Number(req.query.denounceFileId),
        req.currentUser
      );
      if (response.extension === 'pdf') {
        res.writeHead(200, {
          'Content-Type': '' + response.mimeType,
          'Content-Disposition': 'attachment; filename=' + response.name,
          'Content-Length': response.buffer.byteLength
        });
      } else {
        res.writeHead(200, {
          Accept: response.mimeType
        });
      }

      res.end(response.buffer);
    } catch (error) {
      next(error);
    }
  }

  public async deleteDenounceFile(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const fileService: FileService = Container.get(FileService);
      const response: IResponseDTO = await fileService.deleteDenounceFile(
        Number(req.query.denounceFileId),
        req.currentUser
      );
      trackRequest(req, 200, response, true);
      return res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  }

  public async downloadPayrollFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileService: FileService = Container.get(FileService);
      const detailFile: boolean = req.query.detail == 'true';
      const response: IPayrollDTO = await fileService.downloadPayrollFile(
        Number(req.query.payrollId),
        detailFile,
        req.currentUser
      );
      res.writeHead(200, {
        'Content-Type': '' + response.fileMimeType,
        'Content-Disposition': 'attachment; filename=' + response.fileName,
        'Content-Length': response.buffer.byteLength
      });

      trackRequest(req, 200, '<File>', true);
      res.end(response.buffer);
    } catch (error) {
      next(error);
    }
  }

  public async downloadCollectionReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileService: FileService = Container.get(FileService);
      const details: IReportDetail[] = req.body.reports;
      const responseFileDTO: IResponseFileDTO = await fileService.downloadCollectionReports(details, req.currentUser);

      res.writeHead(200, {
        //'Content-Type': '' + details,
        'Content-Disposition': 'attachment; filename=' + responseFileDTO.fileName,
        'Content-Length': responseFileDTO.file.length
      });
      trackRequest(req, 200, '<File>', true);
      res.end(responseFileDTO.file);
    } catch (error) {
      next(error);
    }
  }

  public async generatePrescriptionDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileService: FileService = Container.get(FileService);
      const responseFileDTO: IResponseFileDTO = await fileService.generatePrescriptionDocument(
        String(req.query.insuredRut),
        Number(req.query.policyNumber),
        Number(req.query.requestNumber),
        req.currentUser
      );

      res.writeHead(200, {
        //'Content-Type': '' + details,
        'Content-Disposition': 'attachment; filename=' + responseFileDTO.fileName,
        'Content-Length': responseFileDTO.file.length
      });

      trackRequest(req, 200, '<File>', true);
      res.end(responseFileDTO.file);
    } catch (error) {
      next(error);
    }
  }
}
