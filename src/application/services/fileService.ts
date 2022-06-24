import { Inject, Service } from 'typedi';
import config from '../../config';
import Utils from '../../utils/utils';
import utils from '../../utils/utils';
import { IDenounceFileDTO } from '../../domain/interfaces/dto/v1/IDenounceFile';
import { IAzureUploadResult, IResponseDTO, IResponseFileDTO } from '../../utils/interfaces/IResponse';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import DenounceService from './denounceService';
import AzureStorageRepository from '../../infrastructure/repositories/azureStorageRepository';
import DenounceRepository from '../../infrastructure/database/denounceRepository';
import PayrollRepository from '../../infrastructure/database/payrollRepository';
import { IPayrollDTO } from '../../domain/interfaces/dto/v1/IPayroll';
import { IReportDetail } from '../../domain/interfaces/dto/v1/ICollectionReport';
import { COLLECTION_DOCUMENT_TYPE, FILE_TYPE } from '../../constants/types';
import { IPrescription } from '../../domain/interfaces/dto/v3/IPrescription';
import { IFileService } from '../../domain/interfaces/services/IFileService';
import { generateHr } from '../../utils/pdfutils';
import moment from 'moment';
import ClaimsApi from '../../infrastructure/clients/claimsApi';
import PolicyApi from '../../infrastructure/clients/policyApi';
import { IPolicy } from '../../domain/interfaces/dto/v3/IPolicy';
import { File as IFile } from '../../domain/interfaces/dto/v3/IFile';
import CommonApi from '../../infrastructure/clients/commonApi';
import CollectionApi from '../../infrastructure/clients/collectionApi';
import { getInvoiceType, InvoiceType } from '../../domain/interfaces/dto/v3/ICollection';
import PolicyService from './policyService';
import { IError } from '../../utils/interfaces/IError';
import { IMulterFile } from '../../domain/interfaces/dto/v3/IMulterFile';
import { Logger } from '../../loaders/logger';
import PDFDocument = require('pdfkit');
import AdmZip = require('adm-zip');

@Service('FileService')
export default class FileService implements IFileService {
  @Inject('logger') private readonly logger: Logger;
  @Inject('ClaimsApi') private readonly claimsApi: ClaimsApi;
  @Inject('CollectionApi') private readonly collectionApi: CollectionApi;
  @Inject('PolicyApi') private readonly policyApi: PolicyApi;
  @Inject('CommonApi') private readonly commonApi: CommonApi;
  @Inject('DenounceService') private readonly denounceService: DenounceService;
  @Inject('AzureStorageRepository') private readonly storageRepositoryService: AzureStorageRepository;
  @Inject('DenounceRepository') private readonly denounceRepository: DenounceRepository;
  @Inject('PayrollRepository') private readonly payrollRepository: PayrollRepository;
  @Inject('PolicyService') private readonly policyService: PolicyService;
  private readonly SUFIXDETAIL: string = '-Details';

  async getProductCerticated(
    policyNumber: number,
    insuredRut: string,
    productCode: number,
    user: IUserSSO
  ): Promise<Buffer> {
    const insuredRutNumber: number = Utils.getRutNumber(insuredRut);
    const base64data: string = await this.policyApi.getReport(insuredRutNumber, policyNumber, productCode, user);

    const data: Buffer = await Utils.base64_decode(base64data);

    return data;
  }

  public async getFile(downloadToken: number, user: IUserSSO): Promise<IResponseFileDTO> {
    const fileData: IFile = await this.commonApi.getFileToken(downloadToken, user);

    const data: Buffer = await Utils.base64_decode(fileData.base64);
    const fileName: string = fileData.fileName;

    return {
      code: 0,
      message: 'OK',
      file: data,
      fileName: fileName,
      mimeType: 'application/pdf'
    };
  }

  async getPolicyContract(downloadToken: number, user: IUserSSO): Promise<Buffer> {
    const fileData: IFile = await this.commonApi.getFileToken(downloadToken, user);

    return await Utils.base64_decode(fileData.base64);
  }

  async createDenounceFile(file: IMulterFile, denounceId: number): Promise<IResponseDTO> {
    this.logger.info('Creando archivo de denuncio');
    try {
      const maxSize: number = config.denounceMaxFileSize * 1024 * 1024;
      if (file.buffer.byteLength >= maxSize) {
        throw new Error(`El tamaño del archivo excede el máximo permitido (${maxSize} Mb.)`);
      }
      const directoryPath = `${denounceId}/${file.originalname}`;

      this.logger.info('Subiendo archivo a storage');
      const uploadResult: IAzureUploadResult = await this.storageRepositoryService.uploadFile(
        file,
        denounceId,
        config.denounceAppContainer,
        directoryPath,
        config.denounceAppExtension
      );

      this.logger.info('Resultado storage: ' + uploadResult);
      if (uploadResult.success) {
        const denounceFile: IDenounceFileDTO = {
          denounceApplicationID: denounceId,
          extension: file.originalname.split('.').pop(),
          name: file.originalname,
          mimeType: file.mimetype,
          retryCount: 0,
          blobName: directoryPath
        };
        return await this.denounceService.createDenounceFile(denounceFile);
      } else {
        return {
          code: 1,
          message: 'Error al subir archivo'
        };
      }
    } catch (error) {
      throw new Error('Error al guardar el archivo de denuncio. Error: ' + error.message);
    }
  }

  async downloadDenounceFile(denounceFileId: number, user: IUserSSO): Promise<IDenounceFileDTO> {
    try {
      const denounceFile: IDenounceFileDTO = await this.denounceRepository.getDenounceFile(denounceFileId);

      if (denounceFile) {
        denounceFile.buffer = await this.storageRepositoryService.getFile(
          denounceFile.blobName,
          user.preferredUsername,
          config.denounceAppContainer
        );
        return denounceFile;
      }
    } catch (error) {
      throw new Error('Error al obtener el archivo de denuncio. Error: ' + error.message);
    }
  }

  async deleteDenounceFile(denounceFileId: number, user: IUserSSO): Promise<IResponseDTO> {
    try {
      const denounceFile: IDenounceFileDTO = await this.denounceRepository.getDenounceFile(denounceFileId);

      if (denounceFile) {
        const responseStorageDelete: IResponseDTO = await this.storageRepositoryService.deleteFile(
          denounceFile,
          user.preferredUsername,
          config.denounceAppContainer
        );
        if (responseStorageDelete.code < 1) {
          return await this.denounceRepository.deleteFile(denounceFileId);
        }
      } else {
        return {
          code: 1,
          message: 'Ningun registro encontrado'
        };
      }
    } catch (error) {
      throw new Error('Error al obtener el archivo de denuncio. Error: ' + error.message);
    }
  }

  async downloadPayrollFile(payrollId: number, detailFile: boolean, user: IUserSSO): Promise<IPayrollDTO> {
    try {
      const payroll: IPayrollDTO = await this.payrollRepository.getPayrollById(payrollId);

      if (payroll) {
        const policyUserList: number[] = await this.policyService.getUserPoliciesList(user);

        if (policyUserList.indexOf(payroll.policy) == -1) {
          throw new IError('Unauthorized request', 'UnauthorizedError', 401);
        }

        const blobName: string = detailFile
          ? Utils.appendToFilename(payroll.blobName, this.SUFIXDETAIL)
          : payroll.blobName;
        payroll.fileName = detailFile ? Utils.appendToFilename(payroll.fileName, this.SUFIXDETAIL) : payroll.fileName;

        payroll.buffer = await this.storageRepositoryService.getFile(
          blobName,
          user.preferredUsername,
          config.payrollContainer
        );
        return payroll;
      }
    } catch (error) {
      throw new Error('Error al obtener el archivo de nomina. Error: ' + error.message);
    }
  }

  async downloadCollectionReports(reports: IReportDetail[], user: IUserSSO): Promise<IResponseFileDTO> {
    if (reports.length == 1) {
      let fileBuffer: Buffer;
      this.logger.info(`Obteniendo archivo desde token: ${reports[0].token}`);

      if (reports[0].docType == COLLECTION_DOCUMENT_TYPE.INV) {
        fileBuffer = await this.collectionApi.getInvoicePDF(
          reports[0].token,
          reports[0].invoiceType,
          Utils.RUTINSURANCECONUMBER,
          user
        );
      } else {
        const fileData: IFile = await this.commonApi.getFileToken(reports[0].token, user);
        fileBuffer = await Utils.base64_decode(fileData.base64);
      }

      return {
        code: 0,
        message: 'OK',
        file: fileBuffer,
        mimeType: reports[0].fileType,
        fileName: reports[0].name + '.' + reports[0].fileType.toLocaleLowerCase()
      };
    }

    this.logger.info('Se comienza a recorrer listado de archivos a descargar. Largo:' + reports.length);

    const zip: AdmZip = new AdmZip();
    for (const report of reports) {
      let fileBuffer: Buffer;

      if (report.docType == COLLECTION_DOCUMENT_TYPE.INV) {
        fileBuffer = await this.collectionApi.getInvoicePDF(
          report.token,
          report.invoiceType,
          Utils.RUTINSURANCECONUMBER,
          user
        );
        zip.addFile(report.name + '.' + report.fileType.toLocaleLowerCase(), fileBuffer);
      } else {
        const fileData: IFile = await this.commonApi.getFileToken(report.token, user);
        fileBuffer = await Utils.base64_decode(fileData.base64);
        zip.addFile(report.name, fileBuffer);
      }
    }

    return {
      code: 0,
      message: 'OK',
      file: zip.toBuffer(),
      mimeType: reports[0].fileType,
      fileName: 'Reports' + '.' + FILE_TYPE.ZIP.toLocaleLowerCase()
    };
  }

  async getInvoice(invoice: number, typeInvoice: string, user: IUserSSO): Promise<Buffer> {
    const type: InvoiceType = getInvoiceType(typeInvoice);
    const data: Buffer = await this.collectionApi.getInvoicePDF(invoice, type, Utils.RUTINSURANCECONUMBER, user);

    return data;
  }

  public async generatePrescriptionDocument(
    insuredRut: string,
    policyNumber: number,
    requestNumber: number,
    user: IUserSSO
  ): Promise<IResponseFileDTO> {
    const insuredRutNumber: number = Utils.getRutNumber(insuredRut);
    let requirements: IPrescription[] = await this.claimsApi.getPrescriptions(insuredRutNumber, policyNumber, user);
    requirements = requirements.filter((req: IPrescription) => req.requestNumber == requestNumber);
    const policyDetail: IPolicy = await this.policyApi.getPolicyDetail(policyNumber, user);
    const pdfBuffer: Buffer = await this.generatePrescriptionFile(requestNumber, requirements, policyDetail);
    return {
      code: 0,
      message: 'OK',
      file: pdfBuffer,
      mimeType: 'application/pdf',
      fileName: 'prescription-' + insuredRutNumber + '.' + FILE_TYPE.PDF.toLocaleLowerCase()
    };
  }

  private async generatePrescriptionFile(
    requestNumber: number,
    prescriptions: IPrescription[],
    policyDetail: IPolicy
  ): Promise<Buffer> {
    const margin = 50;
    const logo: string = utils.getTemplateImg('vs.png');
    const firma: string = utils.getTemplateImg('firma3.png');
    let beneficiaryName: string;
    let comment: string;

    for (const prescription of prescriptions) {
      if (prescription.requestNumber == requestNumber) {
        beneficiaryName = prescription.beneficiary.name;
        comment = prescription.name;
        break;
      }
    }

    const doc: PDFDocument = new PDFDocument({
      size: 'A4',
      margin: margin,
      info: {
        Title: 'Receta',
        Author: 'SEGUROS VIDA SECURITY PREVISIÓN S.A.'
      }
    });

    const buffers: Uint8Array[] = [];
    doc.on('data', buffers.push.bind(buffers));

    //Header
    doc
      .image(Buffer.from(logo, 'base64'), doc.page.width - doc.x - 140, doc.y, { width: 140, align: 'right' })
      .moveDown(0.5)
      .fontSize(10)
      .font('Times-Roman')
      .text(`Santiago, ${Utils.formatStringDate(new Date())}`, {
        align: 'right'
      });

    doc.text('Señor (a)');
    doc.text(beneficiaryName);
    doc.text(policyDetail.company.name);

    doc.moveDown(2);
    doc.font('Times-BoldItalic').text('Presente:', { underline: true });
    doc.font('Times-Bold').text(`Ref:${comment} (VISACIONRECETA PERMANENCIA)`);
    // and some justified text wrapped into columns
    generateHr(doc);

    doc.moveDown(1);
    doc.font('Times-Roman').text('De nuestra Consideración:').moveDown(1);

    doc.text(
      'Por medio del presente adjunto encontrará visación de receta a permanencia, debidamente autorizada según siguiente detalle:'
    );

    //Beneficiario y Solicitud
    doc.moveDown(1);
    const benefY: number = doc.y;
    doc.text('- Beneficiario', margin, benefY).text(`: ${beneficiaryName}`, margin + 100, benefY);

    const solY: number = doc.y;
    doc.text('- Solicitud', margin, solY).text(`: ${requestNumber}`, margin + 100, solY);
    doc.moveDown(1);

    //Tabla Medicamentos
    const headerY: number = doc.y + 20;
    doc.font('Times-Bold');
    doc.text('Medicamento', margin, headerY).text('Fecha de Vencimiento', margin + 200, headerY);

    generateHr(doc);

    doc.font('Times-Roman');
    prescriptions.forEach((prescription: IPrescription) => {
      const rowY: number = doc.y;
      doc.text(prescription.name, margin, rowY).text(moment(prescription.endDate).format('L'), margin + 200, rowY);
    });
    doc.moveDown(2);

    //Informacion
    doc
      .text('IMPORTANTE', margin)
      .text('Para futuros reembolsos debe adjuntar ', { continued: true })
      .font('Times-Bold')
      .text('fotocopia de la receta a permanencia o en su defecto esta carta, ', { continued: true })
      .font('Times-Roman')
      .text('junto a la boleta de compra de medicamentos.')
      .text('Le recordamos que la receta debe ser renovada a la fecha de vencimiento.')
      .moveDown(1)
      .text('Sin otro particular, le saluda Atentamente,');

    //Firma
    doc
      .moveDown(6)
      .image(Buffer.from(firma, 'base64'), (doc.page.width - 140) / 2, doc.y, { width: 140, align: 'right' })
      .text('Dpto. de Beneficios', { align: 'center' })
      .text('SEGUROS VIDA SECURITY PREVISIÓN S.A.', { align: 'center' });

    return new Promise<Buffer>((resolve: any) => {
      doc.on('end', () => {
        const pdfData: Buffer = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.end();
    });
  }
}
