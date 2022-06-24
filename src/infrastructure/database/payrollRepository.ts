import { Inject, Service } from 'typedi';
import { IError } from '../../utils/interfaces/IError';
import { IResponseDTO } from '../../utils/interfaces/IResponse';
import { Between, FindManyOptions, getManager, In, EntityManager, DeleteResult } from 'typeorm';
import payrollEntityConverter from './converters/payrollEntityConverter';
import { IPayrollDetailDTO, IPayrollDTO } from '../../domain/interfaces/dto/v1/IPayroll';
import { Payroll } from './entities/payroll';
import { PayrollDetail } from './entities/payrollDetail';
import payrollDetailEntityConverter from './converters/payrollDetailEntityConverter';
import rutjs from 'rut.js';
import { Logger } from 'winston';
import { IPayrollRepository } from '../../domain/interfaces/adapter/IPayrollRepository';
import { trackSQL } from '../../loaders/insight';

@Service('PayrollRepository')
export default class PayrollRepository implements IPayrollRepository {
  @Inject('logger') private readonly logger: Logger;
  private readonly entityManager: EntityManager = getManager();

  async insertPayroll(payrollInput: IPayrollDTO): Promise<IPayrollDTO> {
    const payroll: Payroll = new Payroll();
    payroll.creationDate = payrollInput.creationDate;
    payroll.type = payrollInput.type;
    payroll.typeDescription = payrollInput.typeDescription;
    payroll.blobName = payrollInput.blobName;
    payroll.fileName = payrollInput.fileName;
    payroll.fileExtension = payrollInput.fileExtension;
    payroll.fileMimeType = payrollInput.fileMimeType;
    payroll.policy = payrollInput.policy;
    payroll.contractorRut = payrollInput.contractorRut;
    payroll.contractorName = payrollInput.contractorName;
    payroll.subsidiaryRut = payrollInput.subsidiaryRut;
    payroll.subsidiaryName = payrollInput.subsidiaryName;
    payroll.subsidiaryCode = payrollInput.subsidiaryCode;
    payroll.plan = payrollInput.plan;
    payroll.planCode = payrollInput.planCode;
    payroll.group = payrollInput.group;
    payroll.groupName = payrollInput.groupName;
    payroll.capitalRequired = payrollInput.capitalRequired;
    payroll.incomeRequired = payrollInput.incomeRequired;
    payroll.status = payrollInput.status;
    payroll.exclusionType = payrollInput.exclusionType;

    const startTime: number = Date.now();
    const payrollSaved: Payroll = await this.entityManager.save(Payroll, payroll);

    trackSQL({ payroll: payroll }, 'insertPayroll', payrollSaved, startTime);

    return payrollEntityConverter(payrollSaved);
  }

  async deletePayroll(id: number): Promise<IResponseDTO> {
    const startTime: number = Date.now();
    const response: DeleteResult = await this.entityManager.delete(Payroll, { id: id });
    if (response.affected < 1) {
      throw new IError('Error al eliminar Payroll', 'DeleteError', 1);
    }

    trackSQL({ id: id }, 'deletePayroll', response, startTime);
    return { code: 0, message: 'OK' };
  }

  async updatePayroll(payrollInput: IPayrollDTO): Promise<IPayrollDTO> {
    const startTime: number = Date.now();
    const payroll: Payroll = await this.entityManager.findOne(Payroll, { id: payrollInput.id });
    payroll.creationDate = payrollInput.creationDate;
    payroll.type = payrollInput.type;
    payroll.typeDescription = payrollInput.typeDescription;
    payroll.exclusionType = payrollInput.exclusionType;
    payroll.blobName = payrollInput.blobName;
    payroll.fileName = payrollInput.fileName;
    payroll.fileExtension = payrollInput.fileExtension;
    payroll.fileMimeType = payrollInput.fileMimeType;
    payroll.policy = payrollInput.policy;
    payroll.contractorRut = payrollInput.contractorRut;
    payroll.contractorName = payrollInput.contractorName;
    payroll.subsidiaryRut = payrollInput.subsidiaryRut;
    payroll.subsidiaryName = payrollInput.subsidiaryName;
    payroll.subsidiaryCode = payrollInput.subsidiaryCode;
    payroll.plan = payrollInput.plan;
    payroll.planCode = payrollInput.planCode;
    payroll.group = payrollInput.group;
    payroll.groupName = payrollInput.groupName;
    payroll.capitalRequired = payrollInput.capitalRequired;
    payroll.incomeRequired = payrollInput.incomeRequired;
    payroll.status = payrollInput.status;

    const payrollUpdated: Payroll = await this.entityManager.save(Payroll, payroll);
    trackSQL({ payroll: payrollInput }, 'updatePayroll', payrollUpdated, startTime);
    return payrollEntityConverter(payrollUpdated);
  }

  async addPayrollDetail(detail: IPayrollDetailDTO): Promise<IPayrollDetailDTO> {
    const startTime: number = Date.now();
    const detailEntity: PayrollDetail = new PayrollDetail();
    detailEntity.payrollId = detail.payrollId;
    detailEntity.creationDate = detail.creationDate;
    detailEntity.insuredRut = detail.insuredRut;
    detailEntity.insuredDV = detail.insuredDV;
    detailEntity.dependentRut = detail.dependentRut;
    detailEntity.dependentDV = detail.dependentDV;
    detailEntity.name = detail.name;
    detailEntity.lastName = detail.lastName;
    detailEntity.birthday = detail.birthday;
    detailEntity.gender = detail.gender;
    detailEntity.contractDate = detail.contractDate;
    detailEntity.initDate = detail.initDate;
    detailEntity.endDate = detail.endDate;
    detailEntity.income = detail.income ? BigInt(detail.income) : null;
    detailEntity.capital = detail.capital ? BigInt(detail.capital) : null;
    detailEntity.email = detail.email;
    detailEntity.bank = detail.bank;
    detailEntity.bankName = detail.bankName;
    detailEntity.bankAccountNumber = detail.bankAccountNumber;
    detailEntity.kinship = detail.kinship;
    detailEntity.phone = '123';
    detailEntity.isapre = detail.isapre;
    detailEntity.status = detail.status;

    this.logger.info(`addPayrollDetail - idPayroll: ${JSON.stringify(detail.payrollId)} `);
    this.logger.info(`addPayrollDetail - body: ${JSON.stringify(detail)} `);
    let response: PayrollDetail;
    try {
      response = await this.entityManager.save(PayrollDetail, detailEntity);
      trackSQL({ payrollDetail: detail }, 'addPayrollDetail', response, startTime);
    } catch (e) {
      this.logger.error(e.stack.toString());
      throw e;
    }
    const payrollDetailDTO: IPayrollDetailDTO = payrollDetailEntityConverter(response);
    this.logger.info(`addPayrollDetail - idPayroll saved: ${JSON.stringify(payrollDetailDTO)} `);

    return payrollDetailDTO;
  }

  async getPayrollById(id: number): Promise<IPayrollDTO> {
    const startTime: number = Date.now();
    try {
      this.logger.info(`getPayrollById - id: ${id} `);
      const payroll: Payroll = await this.entityManager.findOne(Payroll, { id: id });
      this.logger.info(`getPayrollById - result: ${JSON.stringify(payroll)} `);

      trackSQL({ id: id }, 'getPayrollById', payroll, startTime);
      return payrollEntityConverter(payroll);
    } catch (e) {
      throw new Error('Error al leer datos de Nomina en BD. Error: ' + e.message);
    }
  }

  async getPayrollsData(): Promise<IPayrollDTO[]> {
    const startTime: number = Date.now();
    try {
      const payrolls: Payroll[] = await this.entityManager.find(Payroll);
      trackSQL({}, 'getPayrollsData', payrolls, startTime);
      const payrollsDTO: IPayrollDTO[] = [];
      payrolls.forEach((p: Payroll) => {
        payrollsDTO.push(payrollEntityConverter(p));
      });

      return payrollsDTO;
    } catch (e) {
      throw new Error('Error al leer datos de Payroll en BD. Error: ' + e.message);
    }
  }

  async getPayrollsHistoryByEstado(
    startDate: Date,
    endDate: Date,
    type: string,
    estados: string[],
    contractorRut: string
  ): Promise<IPayrollDTO[]> {
    const startTime: number = Date.now();
    try {
      let whereConditions: any;
      if (type) {
        whereConditions = {
          status: In(estados),
          creationDate: Between(startDate, endDate),
          contractorRut: rutjs.format(contractorRut).replace(/\./g, ''),
          type: type
        };
      } else {
        whereConditions = {
          status: In(estados),
          creationDate: Between(startDate, endDate),
          contractorRut: rutjs.format(contractorRut).replace(/\./g, '')
        };
      }

      const options: FindManyOptions<Payroll> = {
        where: whereConditions,
        order: { creationDate: 'DESC' },
        relations: ['details']
      };

      this.logger.info('finding Hystory Payrolls options: ' + JSON.stringify(options));
      const payrolls: Payroll[] = await this.entityManager.find(Payroll, options);
      this.logger.info('finding Hystory Payrolls resp: ' + JSON.stringify(payrolls));
      trackSQL({ whereConditions }, 'getPayrollsHistoryByEstado', payrolls, startTime);
      const payrollsDTO: IPayrollDTO[] = [];
      payrolls.forEach((p: Payroll) => {
        payrollsDTO.push(payrollEntityConverter(p));
      });
      return payrollsDTO;
    } catch (e) {
      throw new Error('Error al leer datos de Payroll en BD. Error: ' + e.message);
    }
  }

  async getPayrollsHistoryByInsuredRut(
    startDate: Date,
    endDate: Date,
    type: string,
    estados: string[],
    contractorRut: string,
    insuredRut: string
  ): Promise<IPayrollDTO[]> {
    const startTime: number = Date.now();
    try {
      this.logger.info('Initiating Hystory Payrolls by InsuredRut: ' + JSON.stringify(insuredRut));

      let payrolls: Payroll[] = [];
      if (type) {
        payrolls = await this.entityManager
          .createQueryBuilder()
          .select('payroll')
          .from(Payroll, 'payroll')
          .innerJoinAndSelect('payroll.details', 'detail')
          .where('payroll.status IN (:...estados)', { estados: estados })
          .andWhere('payroll.creationDate BETWEEN :startDate and :endDate', { startDate: startDate, endDate: endDate })
          .andWhere('payroll.contractorRut= :contractorRut', {
            contractorRut: rutjs.format(contractorRut).replace(/\./g, '')
          })
          .andWhere('payroll.type= :type', { type: type })
          .andWhere('detail.insuredRut= :insuredRut', { insuredRut: insuredRut.replace(/\./g, '') })
          .getMany();
      } else {
        payrolls = await this.entityManager
          .createQueryBuilder()
          .select('payroll')
          .from(Payroll, 'payroll')
          .innerJoinAndSelect('payroll.details', 'detail')
          .where('payroll.status IN (:...estados)', { estados: estados })
          .andWhere('payroll.creationDate BETWEEN :startDate and :endDate', { startDate: startDate, endDate: endDate })
          .andWhere('payroll.contractorRut= :contractorRut', {
            contractorRut: rutjs.format(contractorRut).replace(/\./g, '')
          })
          .andWhere('detail.insuredRut= :insuredRut', { insuredRut: insuredRut.replace(/\./g, '') })
          .getMany();
      }
      this.logger.info('finding Hystory Payrolls by InsuredRut resp: ' + JSON.stringify(payrolls));
      trackSQL(
        {
          startDate: startDate,
          endDate: endDate,
          type: type,
          estados: estados,
          contractorRut: contractorRut,
          insuredRut: insuredRut
        },
        'getPayrollsHistoryByInsuredRut',
        payrolls,
        startTime
      );
      const payrollsDTO: IPayrollDTO[] = [];
      payrolls.forEach((p: Payroll) => {
        payrollsDTO.push(payrollEntityConverter(p));
      });

      return payrollsDTO;
    } catch (e) {
      throw new Error('Error al leer datos de Payroll en BD. Error: ' + e.message);
    }
  }
}
