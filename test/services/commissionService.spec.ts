import { Container } from 'typedi';
import logger from '../../src/loaders/logger';
import { iUserSSO, resetMocks, startGlobals } from '../helpers/globalMocks';
import CommissionService from '../../src/application/services/commissionService';
import { IUserDTO } from '../../src/domain/interfaces/dto/administration/IUserDTO';
import AdministrationRepository from '../../src/infrastructure/database/administrationRepository';
import CommissionApi from '../../src/infrastructure/clients/commissionApi';
import { ICommissionPeriodsRes, Intermediary } from '../../src/domain/interfaces/dto/v3/ICommission';
import { IResponseDTO } from '../../src/utils/interfaces/IResponse';

const userData: IUserDTO = {
  clients: [
    {
      name: 'COLBUN  S.A',
      policies: ['1', '2'],
      rut: '78.734.410-0',
      seeAll: false,
      status: 'ENABLED',
      type: 0
    }
  ],
  email: 'test@test.cl',
  name: 'Juan Perez',
  profiles: [4, 5, 6],
  rut: '11.111.111-1',
  status: 'enabled',
  type: '1'
};

const interCodes: Intermediary[] =[
  {
    code: '00007777',
    name: 'Intermediary Name One',
    type: '1'
  }
]

const periodsResp: ICommissionPeriodsRes ={
  "periods":[
    {
      "code":"201911",
      "value":"201911"
    },
    {
      "code":"201912",
      "value":"201912"
    }
  ]
};
    describe('CommissionService', () => {
  Container.set('logger', logger);
  let commissionService: CommissionService;

  beforeAll(async () => {
    Container.set('logger', logger);
    await startGlobals(null, true);
    commissionService = Container.get(CommissionService);
  });
  afterAll(() => {
    resetMocks();
  });

  it('CommissionService be defined', () => {
    expect(commissionService).toBeDefined();
  });

  it('searchIntermediaryCode OK ', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(CommissionApi.prototype, 'getIntermediaryCode').mockImplementation(async () => interCodes);

    const resp: IResponseDTO = await commissionService.searchIntermediaryCode(iUserSSO);
    console.log(resp);
    expect(resp.code).toBe(0);
    expect(resp.data).toHaveLength(1);
  });

  it('searchCommissionPeriods OK ', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(CommissionApi.prototype, 'getCommissionPeriods').mockImplementation(async () => periodsResp);

    const resp: IResponseDTO = await commissionService.searchCommissionPeriods('1', iUserSSO);
    expect(resp.code).toBe(0);
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].months).toHaveLength(2);
  });

  it('searchCommissionPeriods SIN DATOS', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementation(async () => userData);
    jest.spyOn(CommissionApi.prototype, 'getCommissionPeriods').mockImplementation(async () => null);

    const resp: IResponseDTO = await commissionService.searchCommissionPeriods('1', iUserSSO);
    expect(resp.code).toBe(1);
    expect(resp.message).toBe('SIN DATOS');
    expect(resp.data).toHaveLength(0);
  });

});
