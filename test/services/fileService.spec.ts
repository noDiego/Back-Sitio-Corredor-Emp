import { Container } from 'typedi';
import logger from '../../src/loaders/logger';
import FileService from '../../src/application/services/fileService';
import Utils from '../../src/utils/utils';
import { iUserSSO, resetMocks, startGlobals } from '../helpers/globalMocks';
import AzureStorageRepository from '../../src/infrastructure/repositories/azureStorageRepository';
import fs from 'fs';
import path from 'path';
import DenounceService from '../../src/application/services/denounceService';
import { IDenounceFileDTO } from '../../src/domain/interfaces/dto/v1/IDenounceFile';
import { IResponseDTO } from '../../src/utils/interfaces/IResponse';
import DenounceRepository from '../../src/infrastructure/database/denounceRepository';
import { IUserSSO } from '../../src/domain/interfaces/dto/v3/IUserSSO';
import PayrollRepository from '../../src/infrastructure/database/payrollRepository';
import { IPayrollDTO } from '../../src/domain/interfaces/dto/v1/IPayroll';
import { COLLECTION_DOCUMENT_TYPE, FILE_TYPE, PAYROLL_TYPE, KINSHIP } from '../../src/constants/types';
import { IReportDetail } from '../../src/domain/interfaces/dto/v1/ICollectionReport';
import CommonApi from '../../src/infrastructure/clients/commonApi';
import CollectionApi from '../../src/infrastructure/clients/collectionApi';
import PolicyApi from '../../src/infrastructure/clients/policyApi';
import PolicyService from '../../src/application/services/policyService';
import ClaimsApi from '../../src/infrastructure/clients/claimsApi';
import { IPrescription } from '../../src/domain/interfaces/dto/v3/IPrescription';
import { IPolicy } from '../../src/domain/interfaces/dto/v3/IPolicy';
import { IMulterFile } from '../../src/domain/interfaces/dto/v3/IMulterFile';

const payroll: IPayrollDTO = {
  type: PAYROLL_TYPE.VIRTUAL_SUBSCRIPTION,
  typeDescription: 'Suscripción Virtual',
  exclusionType: 'exclusionType',
  policy: 1,
  contractorRut: '12345678',
  contractorName: '1',
  subsidiaryRut: '16813306-5',
  subsidiaryName: 'SubName',
  plan: 'plan',
  planCode: 'plancode',
  group: 'group',
  groupName: 'groupName',
  capitalRequired: true,
  incomeRequired: true,
  blobName: 'FileNameBlob',
  fileName: 'FileName'
};

describe('FileService', () => {
  Container.set('logger', logger);
  let fileService: FileService;

  beforeAll(async () => {
    jest.resetAllMocks();
    await startGlobals(null, true);
    fileService = Container.get(FileService);
  });
  afterAll(() => {
    resetMocks();
  });

  it('fileService be defined', () => {
    expect(fileService).toBeDefined();
  });

  it('FileService getProductCerticated', async () => {
    const fileMock = Buffer.from('');
    const base64Mock =
      'MDI4NzY1IDAwMDAwIG4NCjAwMDAwMjg4NDAgMDAwMDAgbg0KdHJhaWxlcg0KPDwNCi9TaXplIDgNCj4+DQpzdGFydHhyZWYNCjE4OA0KJSVFT0YNCg==';
    const policyNumber = 386778;
    const insuredId = '19834039-8';
    const productId = 3346546375686;
    jest.spyOn(Utils, 'base64_decode').mockImplementation(async () => fileMock);
    jest.spyOn(PolicyApi.prototype, 'getReport').mockImplementation(async () => base64Mock);
    const resp = await fileService.getProductCerticated(policyNumber, insuredId, productId, iUserSSO);
    expect(resp).toEqual(fileMock);
  });

  it('FileService getFile', async () => {
    const bufferMock = Buffer.from('');
    const base64Mock =
      'MDI4NzY1IDAwMDAwIG4NCjAwMDAwMjg4NDAgMDAwMDAgbg0KdHJhaWxlcg0KPDwNCi9TaXplIDgNCj4+DQpzdGFydHhyZWYNCjE4OA0KJSVFT0YNCg==';
    const fileMock = {
      fileName: 'name.pdf',
      fileExtension: 'application/pdf',
      base64: base64Mock
    };
    const downloadToken = 334654633175686;
    jest.spyOn(Utils, 'base64_decode').mockImplementation(async () => bufferMock);
    jest.spyOn(CommonApi.prototype, 'getFileToken').mockImplementation(async () => fileMock);
    const resp = await fileService.getFile(downloadToken, iUserSSO);
    expect(resp.file).toEqual(bufferMock);
  });

  it('FileService getPolicyContract', async () => {
    const bufferMock = Buffer.from('');
    const base64Mock =
      'MDI4NzY1IDAwMDAwIG4NCjAwMDAwMjg4NDAgMDAwMDAgbg0KdHJhaWxlcg0KPDwNCi9TaXplIDgNCj4+DQpzdGFydHhyZWYNCjE4OA0KJSVFT0YNCg==';
    const fileMock = {
      fileName: 'name.pdf',
      fileExtension: 'application/pdf',
      base64: base64Mock
    };
    const downloadToken = 334654633175686;
    jest.spyOn(Utils, 'base64_decode').mockImplementation(async () => bufferMock);
    jest.spyOn(CommonApi.prototype, 'getFileToken').mockImplementation(async () => fileMock);
    const resp = await fileService.getPolicyContract(downloadToken, iUserSSO);
    expect(resp).toEqual(bufferMock);
  });

  it('FileService createDenounceFile', async () => {
    const uploadResp = {
      success: true,
      details: null
    };
    const insertResponse: IDenounceFileDTO = {
      denounceApplicationID: 1,
      extension: '',
      mimeType: '',
      name: ''
    };

    const response: IResponseDTO = {
      code: 0,
      message: 'OK',
      data: insertResponse
    };

    const fileDummy = fs.readFileSync(path.resolve(__dirname, '../__mocks__/files/Suscripcion_Virtual_Malo.xlsx'));
    const file: IMulterFile = {
      buffer: fileDummy,
      originalname: 'Suscripcion_Virtual_Malo.xlsx',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fieldname: '',
      destination: '',
      encoding: '',
      filename: '',
      path: '',
      size: 1000,
      stream: null
    };

    jest.spyOn(AzureStorageRepository.prototype, 'uploadFile').mockImplementation(async () => uploadResp);
    jest.spyOn(DenounceService.prototype, 'createDenounceFile').mockImplementation(async () => response);
    const resp = await fileService.createDenounceFile(file, 2);
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('FileService downloadDenounceFile', async () => {
    const denounceFiletResponse: IDenounceFileDTO = {
      denounceApplicationID: 1,
      extension: '',
      mimeType: '',
      name: ''
    };
    const fileMock = Buffer.from('');

    jest.spyOn(AzureStorageRepository.prototype, 'getFile').mockImplementation(async () => fileMock);
    jest.spyOn(DenounceRepository.prototype, 'getDenounceFile').mockImplementation(async () => denounceFiletResponse);
    const resp = await fileService.downloadDenounceFile(2, iUserSSO);
    expect(jest.spyOn(AzureStorageRepository.prototype, 'getFile')).toHaveBeenCalled();
    expect(jest.spyOn(DenounceRepository.prototype, 'getDenounceFile')).toHaveBeenCalled();
    expect(resp.buffer).toBe(fileMock);
  });

  it('FileService deleteDenounceFile', async () => {
    const denounceFiletResponse: IDenounceFileDTO = {
      denounceApplicationID: 1,
      extension: '',
      mimeType: '',
      name: ''
    };

    const response = { success: true, code: 0, message: 'OK' };

    jest.spyOn(AzureStorageRepository.prototype, 'deleteFile').mockImplementation(async () => response);
    jest.spyOn(DenounceRepository.prototype, 'getDenounceFile').mockImplementation(async () => denounceFiletResponse);
    jest.spyOn(DenounceRepository.prototype, 'deleteFile').mockImplementation(async () => response);
    const resp = await fileService.deleteDenounceFile(2, iUserSSO);
    expect(jest.spyOn(AzureStorageRepository.prototype, 'deleteFile')).toHaveBeenCalled();
    expect(jest.spyOn(DenounceRepository.prototype, 'getDenounceFile')).toHaveBeenCalled();
    expect(jest.spyOn(DenounceRepository.prototype, 'deleteFile')).toHaveBeenCalled();
    expect(resp.code).toBe(0);
    expect(resp.message).toBe('OK');
  });

  it('FileService downloadPayrollFile', async () => {
    const fileMock = Buffer.from('');

    jest.spyOn(AzureStorageRepository.prototype, 'getFile').mockImplementation(async () => fileMock);
    jest.spyOn(PayrollRepository.prototype, 'getPayrollById').mockImplementation(async () => payroll);
    jest.spyOn(PolicyService.prototype, 'getUserPoliciesList').mockImplementation(async () => [1, 4]);

    const resp = await fileService.downloadPayrollFile(2, true, iUserSSO);
    expect(jest.spyOn(AzureStorageRepository.prototype, 'getFile')).toHaveBeenCalled();
    expect(jest.spyOn(PayrollRepository.prototype, 'getPayrollById')).toHaveBeenCalled();
    expect(jest.spyOn(PolicyService.prototype, 'getUserPoliciesList')).toHaveBeenCalled();
    expect(resp.buffer).toBe(fileMock);
  });

  it('FileService getInvoice', async () => {
    const fileMock = Buffer.from('');
    jest.spyOn(Utils, 'base64_decode').mockImplementation(async () => fileMock);
    jest.spyOn(CollectionApi.prototype, 'getInvoicePDF').mockImplementation(async () => fileMock);
    const resp = await fileService.getInvoice(1, 'EXENTA', iUserSSO);
    expect(resp).toEqual(fileMock);
  });

  it('downloadCollectionReport', async () => {
    const bufferMock = Buffer.from('');

    const fileMock = {
      fileName: 'filename',
      fileExtension: 'pdf',
      base64: '123456'
    };

    const report: IReportDetail = {
      docType: COLLECTION_DOCUMENT_TYPE.AJU,
      fileType: FILE_TYPE.XLSX,
      mount: 0,
      name: '',
      token: 0
    };
    jest.spyOn(CommonApi.prototype, 'getFileToken').mockImplementation(async () => fileMock);
    jest.spyOn(CollectionApi.prototype, 'getInvoicePDF').mockImplementation(async () => bufferMock);
    const resp = await fileService.downloadCollectionReports([report], iUserSSO);
    expect(resp.fileName).toEqual('.' + report.fileType.toLocaleLowerCase());
  });

  it('downloadCollectionReports 2 (reportes)', async () => {
    const bufferMock = Buffer.from('');

    const fileMock = {
      fileName: 'filename',
      fileExtension: 'pdf',
      base64: '123456'
    };

    const report: IReportDetail = {
      docType: COLLECTION_DOCUMENT_TYPE.AJU,
      fileType: FILE_TYPE.XLSX,
      mount: 0,
      name: '',
      token: 0
    };
    jest.spyOn(CommonApi.prototype, 'getFileToken').mockImplementation(async () => fileMock);
    jest.spyOn(CollectionApi.prototype, 'getInvoicePDF').mockImplementation(async () => bufferMock);
    const resp = await fileService.downloadCollectionReports([report, report], iUserSSO);
    expect(resp.fileName).toEqual('Reports.' + FILE_TYPE.ZIP.toLocaleLowerCase());
  });

  it('generatePrescriptionDocument OK', async () => {
    const policyNumber = 281732;
    const insuredRut = '19834039-8';
    const requestNumber = 3346546375686;

    const prescriptios: IPrescription[] = [];
    prescriptios.push({
      beneficiary: {
        correlative: 11647501,
        dv: '7',
        name: 'DEBORAH PAZ ACUÑA ABURTO',
        relacion: KINSHIP.TITULAR,
        rut: 17151482
      },
      requestNumber: 3346546375686,
      name: 'Receta.pdf',
      issueDate: new Date('2021-02-08T16:17:12.706Z'),
      comment: 'Receta retenida',
      endDate: new Date('2021-02-08T16:17:12.706Z')
    });

    const policyDetail: IPolicy = {
      renewalId: 11068608,
      renewal: 8,
      policyNumber: 281732,
      insuranceCoRut: '99301000-6',
      holding: {
        number: 281732,
        name: 'ANDOVER ALIANZA MEDCA S.A.'
      },
      contractor: {
        rut: '96625550-1',
        name: 'ANDOVER ALIANZA MEDICA S.A.'
      },
      company: {
        rut: '96625550-1',
        name: 'ANDOVER ALIANZA MEDICA S.A.',
        businessActivity: 'DISTRIBUIDORA-COMERCIO'
      },
      broker: {
        rut: '78734410-0',
        name: 'DE SEGUROS LTDA. MERCER CORREDORES'
      },
      status: 'VIGENTE',
      firstTerm: new Date(),
      startDate: new Date(),
      endDate: new Date(),
      productDescription: ['VIDA', 'SALUD'],
      numberOfHolders: 40,
      numberOfBeneficiaries: 36,
      hasBlockedBenefits: false,
      hasDebt: true,
      hasHealthBenefits: true,
      hasPendingRequirements: false,
      insuredList: []
    };

    jest.spyOn(ClaimsApi.prototype, 'getPrescriptions').mockImplementation(async () => prescriptios);
    jest.spyOn(PolicyApi.prototype, 'getPolicyDetail').mockImplementation(async () => policyDetail);
    const resp = await fileService.generatePrescriptionDocument(insuredRut, policyNumber, requestNumber, iUserSSO);
    expect(jest.spyOn(ClaimsApi.prototype, 'getPrescriptions')).toHaveBeenCalled();
    expect(jest.spyOn(PolicyApi.prototype, 'getPolicyDetail')).toHaveBeenCalled();
    expect(resp.code).toBe(0);
    expect(resp.message).toBe('OK');
  });
});
