import { startGlobals } from '../../helpers/globalMocks';
import { IPayrollDetailDTO, IPayrollDTO } from '../../../src/domain/interfaces/dto/v1/IPayroll';
import { PAYROLL_STATUS } from '../../../src/constants/status';
import { PAYROLL_TYPE } from '../../../src/constants/types';
import { Payroll } from '../../../src/infrastructure/database/entities/payroll';
import { PayrollDetail } from '../../../src/infrastructure/database/entities/payrollDetail';
import { Container } from 'typedi';
import PayrollRepository from '../../../src/infrastructure/database/payrollRepository';
import { IPayrollRepository } from '../../../src/domain/interfaces/adapter/IPayrollRepository';
import typeorm = require('typeorm');
import { clone } from "../../../src/utils/utils";

const payrollDTOBase: IPayrollDTO = {
  id: 132,
  creationDate: new Date('2020-10-15T07:35:18.000Z'),
  type: PAYROLL_TYPE.VIRTUAL_SUBSCRIPTION_INDIVIDUAL['EXCLUSION_INSURED'],
  typeDescription: 'Exclusión de asegurados',
  exclusionType: 'EXCLUDE_FROM_ALL',
  blobName: '132/Exclusiones.xlsx',
  fileName: 'Exclusiones.xlsx',
  fileExtension: 'xlsx',
  fileMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  policy: null,
  contractorRut: '79587210-8',
  contractorName: 'MINERA ESCONDIDA LTDA',
  subsidiaryRut: null,
  subsidiaryName: null,
  plan: null,
  planCode: null,
  group: null,
  groupName: null,
  capitalRequired: false,
  incomeRequired: false,
  details: [],
  status: PAYROLL_STATUS.TERMINADO_CON_ERROR
};

const payrolldetailDTOBase: IPayrollDetailDTO = {
  id: 85,
  rowNumber: 5,
  payrollId: 131,
  creationDate: new Date('2020-10-15T05:41:59.000Z'),
  insuredRut: 17956845,
  insuredDV: '4',
  dependentRut: 111111111,
  dependentDV: '1',
  name: 'name',
  lastName: 'lastname',
  birthday: new Date('2020-10-15T05:41:59.000Z'),
  gender: null,
  initDate: null,
  endDate: new Date('2020-10-15T04:12:03.000Z'),
  income: '1',
  capital: '1',
  email: null,
  bank: null,
  bankName: null,
  bankAccountNumber: null,
  kinship: null,
  phone: null,
  isapre: '',
  status: 'TERMINADO CON ERROR',
  invalidDetail: 'Error Description Test',
  contractDate: new Date('2020-10-15T04:12:03.000Z')
};

const payrollEntityBase: Payroll = {
  id: 139,
  creationDate: new Date('2020-10-15T17:41:57.000Z'),
  type: 'VIRTUAL_SUBSCRIPTION',
  typeDescription: 'Suscripción Virtual',
  exclusionType: 'undefined',
  blobName: '139/Excel_prueba_OK_error.xlsx',
  fileName: 'Excel_prueba_OK_error.xlsx',
  fileExtension: 'xlsx',
  fileMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  policy: 281874,
  contractorRut: '70016330-K',
  contractorName: 'CAJA DE COMPENSACION DE ASIGNACION FAMILIAR LOS HEROES',
  subsidiaryCode: 545364,
  subsidiaryRut: 'undefined',
  subsidiaryName: 'TRANSPORTES GEMINIS SA',
  plan: 'PLAN EMPLEADOS MENORES DE 65 AÑOS (V+MA+ITP 2/3+DESM.)',
  planCode: '254141',
  group: null,
  groupName: null,
  capitalRequired: true,
  incomeRequired: false,
  status: 'EN PROCESO',
  invalidRows: 0,
  details: []
};

const payrollDetailEntityBase: PayrollDetail = {
  id: 95,
  payroll: undefined,
  rowNumber: 5,
  payrollId: 134,
  creationDate: new Date('2020-10-15T05:44:48.000Z'),
  insuredRut: 17956845,
  insuredDV: '4',
  dependentRut: null,
  dependentDV: null,
  name: null,
  lastName: null,
  birthday: null,
  gender: null,
  initDate: null,
  endDate: new Date('2020-10-01T00:00:00.000Z'),
  income: null,
  capital: null,
  email: null,
  bank: null,
  bankName: null,
  bankAccountNumber: null,
  kinship: null,
  phone: null,
  isapre: '',
  status: 'TERMINADO CON ERROR',
  invalidDetail: 'Error Description Test',
  contractDate: new Date('2020-10-01T00:00:00.000Z')
};

describe('Payroll Repository Tests', () => {
  let payrollDTO: IPayrollDTO;
  let payrolldetailDTO: IPayrollDetailDTO;
  let payrollEntity: Payroll;
  let payrollDetailEntity: PayrollDetail;

  beforeEach(() => {
    jest.resetAllMocks();
    startGlobals(null, true);
    payrollDTO = clone(payrollDTOBase);
    payrolldetailDTO = clone(payrolldetailDTOBase);
    payrollEntity = clone(payrollEntityBase);
    payrollDetailEntity = clone(payrollDetailEntityBase);
  });

  afterEach(() => {
    Container.remove(PayrollRepository);
  });

  const payrollManager = {
    //Mock de getRepository para payroll
    save: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findByIds: jest.fn().mockReturnThis(),
    findAndCount: jest.fn().mockReturnThis()
  };

  it('DenounceRepository define OK', () => {
    const repoInstance: PayrollRepository = Container.get(PayrollRepository);
    expect(repoInstance).toBeDefined();
  });

  it('addPayroll OK', async () => {
    payrollManager.save = jest.fn().mockReturnValue(payrollEntity);
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);

    const responsePayroll = await repoInstance.insertPayroll(payrollDTO);

    expect(payrollManager.save).toHaveBeenCalled();
    expect(responsePayroll.status).toBe(payrollEntity.status);
  });

  it('deletePayroll OK', async () => {
    payrollManager.delete = jest.fn().mockReturnValue({ affected: 1 });
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);

    const responsePayroll = await repoInstance.deletePayroll(payrollDTO.id);

    expect(payrollManager.delete).toHaveBeenCalled();
    expect(responsePayroll.code).toBe(0);
  });

  it('deletePayroll ERROR', async () => {
    payrollManager.delete = jest.fn().mockReturnValue({ affected: 0 });
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);

    repoInstance.deletePayroll(payrollDTO.id).catch((e) => {
      expect(payrollManager.delete).toHaveBeenCalled();
      expect(e.name).toBe('DeleteError');
    });
  });

  it('addPayrollDetail payroll OK', async () => {
    payrollManager.save = jest.fn().mockReturnValue(payrollEntity);
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);

    await repoInstance.addPayrollDetail(payrolldetailDTO);

    expect(payrollManager.save).toHaveBeenCalled();
  });

  it('getPayroll OK', async () => {
    payrollManager.findOne = jest.fn().mockReturnValue(payrollEntity);
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);

    const response = await repoInstance.getPayrollById(payrollDTO.id);
    expect(response.status).toBe(payrollEntity.status);
    expect(response.fileExtension).toBe(payrollEntity.fileExtension);
    expect(response.blobName).toBe(payrollEntity.blobName);
  });

  it('getPayrollDetail OK', async () => {
    payrollManager.findOne = jest.fn().mockReturnValue(payrollDetailEntity);
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);

    const response = await repoInstance.getPayrollById(payrollDTO.id);
    expect(response.status).toBe(payrollDetailEntity.status);
    expect(response.creationDate).toBe(payrollDetailEntity.creationDate);
  });

  it('getPayrollsHistoryByEstado OK', async () => {
    payrollManager.find = jest.fn().mockReturnValue([payrollEntity]);
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);

    const response: IPayrollDTO[] = await repoInstance.getPayrollsHistoryByEstado(
      new Date(),
      new Date(),
      'type',
      ['STATUS'],
      '11.111.111-1'
    );
    expect(response[0].status).toBe(payrollEntity.status);
    expect(response[0].creationDate).toBe(payrollEntity.creationDate);
  });

  it('getPayrollsHistoryByEstado sin Type OK', async () => {
    payrollManager.find = jest.fn().mockReturnValue([payrollEntity]);
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);

    const response: IPayrollDTO[] = await repoInstance.getPayrollsHistoryByEstado(
      new Date(),
      new Date(),
      undefined,
      ['STATUS'],
      '11.111.111-1'
    );
    expect(response[0].status).toBe(payrollEntity.status);
    expect(response[0].creationDate).toBe(payrollEntity.creationDate);
  });

  it('update payroll OK', async () => {
    payrollManager.save = jest.fn().mockReturnValue(payrollEntity);
    payrollManager.findOne = jest.fn().mockReturnValue(payrollEntity);
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);
    payrollDTO.status = 'EN_PROCESO';

    const response = await repoInstance.updatePayroll(payrollDTO);
    expect(response.status).toBe('EN_PROCESO');
  });

  it('getPayrollsData OK', async () => {
    payrollManager.find = jest.fn().mockReturnValue([payrollEntity, payrollEntity]);
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);

    const response = await repoInstance.getPayrollsData();
    expect(response[0].status).toBe(payrollEntity.status);
    expect(response).toHaveLength(2);
    expect(payrollManager.find).toHaveBeenCalled();
  });

  it('getPayrollsData ERROR', async () => {
    payrollManager.find = jest.fn().mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    payrollManager.findOne = jest.fn().mockReturnValue(payrollEntity);
    typeorm.getManager = jest.fn().mockReturnValue(payrollManager);
    const repoInstance: IPayrollRepository = Container.get(PayrollRepository);
    payrollDTO.status = 'EN_PROCESO';

    await repoInstance.getPayrollsData().catch((error) => {
      expect(error.message).toBe('Error al leer datos de Payroll en BD. Error: Test');
    });
    expect(payrollManager.find).toHaveBeenCalled();
  });
});
