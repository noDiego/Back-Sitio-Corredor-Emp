import { Inject, Service } from 'typedi';
import { Logger } from '../../loaders/logger';
import { ICommissionService } from '../../domain/interfaces/services/ICommissionService';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { IResponseDTO } from '../../utils/interfaces/IResponse';
import CommissionApi from '../../infrastructure/clients/commissionApi';
import { ICommissionPeriodsRes, Intermediary, IPeriod, IPeriodYear, ICommissionTotals } from '../../domain/interfaces/dto/v3/ICommission';
import moment, { Moment } from 'moment';
import Utils from '../../utils/utils';
import { IUserDTO } from '../../domain/interfaces/dto/administration/IUserDTO';
import AdministrationRepository from '../../infrastructure/database/administrationRepository';
import { IClientDTO } from '../../domain/interfaces/dto/administration/IClientDTO';

@Service('CommissionService')
export default class CommissionService implements ICommissionService {
  @Inject('logger') private readonly logger: Logger;
  @Inject('CommissionApi') private readonly commissionApi: CommissionApi;
  @Inject('AdministrationRepository') private readonly databaseService: AdministrationRepository;

  async searchIntermediaryCode(user: IUserSSO): Promise<IResponseDTO> {
    try {
      const userData: IUserDTO = await this.databaseService.getUserData(user.preferredUsername);
      const client: IClientDTO = userData.clients[0];
      const brokerRut: string = client.rut;
      this.logger.info('searchIntermediaryCode - input rut de corredor : ' + brokerRut);
      const intermediaries: Intermediary[] = await this.commissionApi.getIntermediaryCode(brokerRut, user);

      this.logger.info(
        'searchIntermediaryCode - cantidad de codigos intermediarios encontrados para rut corredor(' +
          brokerRut +
          '): ' +
          intermediaries.length
      );

      return {
        code: intermediaries.length > 0 ? 0 : 1,
        message: intermediaries.length > 0 ? 'OK' : 'SIN DATOS',
        data: intermediaries
      };
    } catch (e) {
      this.logger.error('searchIntermediaryCode - error excepcion: ' + e.message);
      throw e;
    }
  }

  async searchCommissionPeriods(intermediaryCode: string, user: IUserSSO): Promise<IResponseDTO> {
    const yearList: IPeriodYear[] = [];
    const periodsRes: ICommissionPeriodsRes = await this.commissionApi.getCommissionPeriods(intermediaryCode, user);

    if (periodsRes) {
      periodsRes.periods.sort();
      periodsRes.periods.forEach((period: IPeriod) => {
        const datePeriod: Moment = moment(period.value, 'YYYYMM');
        //Se busca año en listado
        let year: IPeriodYear = yearList.find(
          (predContractor: IPeriodYear) => predContractor.code == datePeriod.format('YYYY')
        );
        if (!year) {
          year = {
            code: datePeriod.format('YYYY'),
            name: datePeriod.format('YYYY'),
            months: []
          };
          yearList.push(year);
        }
        year.months.push({
          code: datePeriod.format('MM'),
          name: Utils.toTitleCase(datePeriod.format('MMMM'))
        });
      });
    }

    return { code: yearList.length > 0 ? 0 : 1, data: yearList, message: yearList.length > 0 ? 'OK' : 'SIN DATOS' };
  }

  async searchCommissionsTotal(intermediaryCode: string, period: number, user: IUserSSO): Promise<IResponseDTO> {
    this.logger.info('searchCommissionsTotal - intermediaryCode : ' + intermediaryCode + ', period : ' + period);
    const totalRes: ICommissionTotals = await this.commissionApi.getCommissionsTotals(intermediaryCode, period, user);

    return {
      code: totalRes ? 0 : 1,
      message: totalRes ? 'OK' : 'SIN DATOS',
      data: totalRes
    };
  }
}
