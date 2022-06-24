import moment from 'moment';
import * as exceljs from 'exceljs';
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import CollectionService from '../../../application/services/collectionService';
import FileService from '../../../application/services/fileService';
import { ICollectionReportInput } from '../../../domain/interfaces/dto/v1/ICollectionReport';
import { trackRequest } from '../../../loaders/insight';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';

export default class CollectionController {
  public async searchCollectionsPendingDebt(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const collectionService: CollectionService = Container.get(CollectionService);
      const collections: IResponseDTO = await collectionService.searchCollectionsPendingDebt(
        req.query.companyRut as string,
        req.query.data as string,
        +req.query.page,
        +req.query.limit,
        req.currentUser
      );
      trackRequest(req, 200, collections, true);
      return res.status(200).json(collections);
    } catch (e) {
      next(e);
    }
  }

  public async generateExcelInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collectionService: CollectionService = Container.get(CollectionService);
      const fileName: string = 'Cobranza_' + moment().format('YYYYMMDDHHmmss') + '.xlsx';
      const excelInvoices: exceljs.Buffer = await collectionService.generateExcelInvoices(
        req.query.companyRut as string,
        req.query.data as string,
        req.currentUser
      );
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=' + fileName,
        'Content-Length': excelInvoices.byteLength
      });
      trackRequest(req, 200, '<File>', true);
      res.end(excelInvoices);
    } catch (e) {
      next(e);
    }
  }

  public async getInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileName: string = 'Factura_' + req.query.downloadToken + '.pdf';
      const fileService: FileService = Container.get<FileService>('FileService');
      const archivoCertificado: Buffer = await fileService.getInvoice(
        +req.query.invoiceNumber,
        req.query.invoiceType as string,
        req.currentUser
      );

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

  public async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collectionService: CollectionService = Container.get(CollectionService);
      const input: ICollectionReportInput = {
        period: req.body.period as string,
        polices: req.body.polices as Array<number>
      };
      const reports: IResponseDTO = await collectionService.getReports(
        input,
        req.body.page,
        req.body.limit,
        req.currentUser
      );

      trackRequest(req, 200, reports, true);
      return res.status(200).json(reports).end();
    } catch (e) {
      next(e);
    }
  }
  public async searchPaymentHistory(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const collectionService: CollectionService = Container.get(CollectionService);
      const paymentHistory: IResponseDTO = await collectionService.searchPaymentHistory(
        req.query.contractorRut as string,
        +req.query.dateCode,
        +req.query.page,
        +req.query.limit,
        req.currentUser
      );
      trackRequest(req, 200, paymentHistory, true);
      return res.status(200).json(paymentHistory);
    } catch (e) {
      next(e);
    }
  }

  public async generateExcelPaymentHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collectionService: CollectionService = Container.get(CollectionService);
      const fileName: string = 'HistorialPago_' + moment().format('YYYYMMDDHHmmss') + '.xlsx';
      const excelInvoices: exceljs.Buffer = await collectionService.generateExcelPaymentHistory(
        req.query.contractorRut as string,
        +req.query.dateCode,
        req.currentUser
      );
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=' + fileName,
        'Content-Length': excelInvoices.byteLength
      });
      trackRequest(req, 200, '<File>', true);
      res.end(excelInvoices);
    } catch (e) {
      next(e);
    }
  }
}
