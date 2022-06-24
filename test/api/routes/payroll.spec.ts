import { startGlobals } from '../../helpers/globalMocks';
import express from 'express';
import request from 'supertest';
import { IResponseDTO } from '../../../src/utils/interfaces/IResponse';
import PayrollService from '../../../src/application/services/payrollService';

const app = express();
const prefix = '/v1/payroll';
const iresponse: IResponseDTO = {
  code: 0,
  message: 'OK'
};

const inputSingle = {
  beneficiaries: ['16.813.306-5', '12.123.345-6'],
  payroll: {
    type: 'VIRTUAL_SUBSCRIPTION',
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
    capitalRequired: 'true',
    incomeRequired: 100
  },
  detail: {
    creationDate: '2010-05-01',
    insuredRut: 16813306,
    insuredDV: '5',
    dependentRut: '8990893',
    dependentDV: '0',
    name: 'name',
    lastName: 'lastName',
    birthday: '2015-05-01 15:23',
    gender: 'M',
    contractDate: '2020-10-02',
    initDate: '2020-11-01',
    endDate: '2020-12-02',
    income: 30,
    capital: 30,
    email: 'test@test.com',
    bank: '1',
    bankName: 'bankName',
    bankAccountNumber: 123,
    kinship: 'kinship',
    phone: '+56912345678',
    isapre: 'isapre'
  }
};

describe('Payroll Route', () => {
  beforeAll(async () => {
    await startGlobals(app, true);
  });
  it('dummyTest', async () => {
    expect(1).toBe(1);
  });

  it('se llama a ruta para creacion de payroll single', async () => {
    try {
      jest.spyOn(PayrollService.prototype, 'addPayroll').mockImplementationOnce(async () => iresponse);
      const resp = await request(app)
        .post(prefix + '/single')
        .set('Auth-Token', '12345')
        .send(inputSingle);
      expect(resp.status).toBe(200);
    } catch (e) {
      console.log(e);
    }
  });

  it('se llama a ruta para getHistoryPayrollData', async () => {
    jest.spyOn(PayrollService.prototype, 'getHistoryPayrollData').mockImplementationOnce(async () => iresponse);
    const resp = await request(app)
      .get(prefix + '/history?codeDate=5&page=1&limit=100&contractorRut=16813306-5&type=INCLUSION_INSURED')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toBe(200);
  });
});
