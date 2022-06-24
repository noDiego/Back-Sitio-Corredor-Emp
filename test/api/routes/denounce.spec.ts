import express from 'express';
import request from 'supertest';
import { IResponseDTO } from '../../../src/utils/interfaces/IResponse';
import moment from 'moment';
import { iUserSSO, startGlobals } from '../../helpers/globalMocks';
import DenounceService from '../../../src/application/services/denounceService';
import rutjs from 'rut.js';
import { IValueObjectV1 } from '../../../src/domain/interfaces/dto/v1/IValueObject';
import { IDenounceDTO, IDenounceSearchRequestDTO } from '../../../src/domain/interfaces/dto/v1/IDenounce';

const app = express();
const prefix = '/v1/denounce';

const applicationNumber = 28306064564;

const insured: IValueObjectV1 = {
  code: '10726792-1',
  name: 'CECILIA DE LAS NIEVES SOBARZO MORALES'
};

const beneficiary: IValueObjectV1 = {
  code: '13903510',
  name: 'JOSE ALBERTO BADILLA SOBARZO'
};

const broker: IValueObjectV1 = {
  code: rutjs.format('11.111.111-1'),
  name: 'CARLOS GUITIERREZ'
};

const company: IValueObjectV1 = {
  code: rutjs.format('97029000-1'),
  name: 'Banco Central de Chile'
};
const denounces: IDenounceDTO[] = [];
denounces.push({
  consignment: 'BATCHCIMED553234682-96661547',
  applicationNumber: applicationNumber,
  policy: 345765,
  plan: 'SALUD/DENTAL BASE',
  startDateContract: moment('2020-01-01').toDate(),
  endDateContract: moment('2020-12-31').toDate(),
  firstTerm: moment('2020-01-01').toDate(),
  changeFactor: 28469.54,
  denounceDate: moment('2020-03-01').toDate(),
  liquidationDate: moment('2020-03-01').toDate(),
  insured: insured,
  beneficiary: beneficiary,
  status: 'Pagado',
  denounceUser: rutjs.format('11.111.111-1'),
  broker: broker,
  company: company,
  amountClaim: 28700,
  amountPay: 28700,
  observation: 'Esto es una observación'
});
denounces.push({
  consignment: 'BATCHCIMED553234682-96661547',
  applicationNumber: 28306064564,
  policy: 345765,
  plan: 'SALUD/DENTAL BASE',
  startDateContract: moment('2020-01-01').toDate(),
  endDateContract: moment('2020-12-31').toDate(),
  firstTerm: moment('2020-01-01').toDate(),
  changeFactor: 28469.54,
  denounceDate: moment('2020-03-01').toDate(),
  liquidationDate: moment('2020-03-01').toDate(),
  insured: insured,
  beneficiary: beneficiary,
  status: 'Pagado',
  denounceUser: rutjs.format('11.111.111-1'),
  broker: broker,
  company: company,
  amountClaim: 28700,
  amountPay: 28700,
  observation: 'Esto es una observación'
});
denounces.push({
  consignment: 'BATCHCIMED553234682-96661547',
  applicationNumber: 28306064564,
  policy: 345765,
  plan: 'SALUD/DENTAL BASE',
  startDateContract: moment('2020-01-01').toDate(),
  endDateContract: moment('2020-12-31').toDate(),
  firstTerm: moment('2020-01-01').toDate(),
  changeFactor: 28469.54,
  denounceDate: moment('2020-03-01').toDate(),
  liquidationDate: moment('2020-03-01').toDate(),
  insured: insured,
  beneficiary: beneficiary,
  status: 'Pagado',
  denounceUser: rutjs.format('11.111.111-1'),
  broker: broker,
  company: company,
  amountClaim: 28700,
  amountPay: 28700,
  observation: 'Esto es una observación'
});

const objRouteDenounceXLS: IDenounceSearchRequestDTO = {
  applicationNumber: NaN,
  codeDate: 300,
  status: 'Pagado',
  onlyMine: true,
  consignment: undefined,
  contractorRut: undefined,
  insuredRut: insured.code,
  policy: NaN
};

const response: IResponseDTO = {
  code: 0,
  message: 'OK',
  data: denounces,
  page: 1,
  limit: 3,
  totalPage: 1,
  recordTotal: 3
};

describe('Denounce Route', () => {
  beforeAll(async () => {
    await startGlobals(app, true);
  });

  it('se debe obtener error en ficha de denuncio', async () => {
    jest.spyOn(DenounceService.prototype, 'findDenounce').mockImplementation(async () => {
      throw new Error('Error ficha denuncio');
    });

    const resp = await request(app)
      .get(prefix + '/file?applicationNumber=' + applicationNumber)
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toEqual(500);
  });

  it('se debe obtener ficha de denuncio', async () => {
    jest.spyOn(DenounceService.prototype, 'findDenounce').mockImplementationOnce(async () => denounces[0]);

    const resp = await request(app)
      .get(prefix + '/file?applicationNumber=' + applicationNumber)
      .set('Auth-Token', '12345')
      .send();
    expect(resp.body.applicationNumber).toBe(denounces[0].applicationNumber);
    expect(resp.body.insured).toEqual(denounces[0].insured);
  });

  it('se debe obtener error de acceso a ficha de denuncio', async () => {
    jest.spyOn(DenounceService.prototype, 'findDenounce').mockImplementationOnce(async () => denounces[0]);

    const resp = await request(app)
      .get(prefix + '/file?applicationNumber=' + applicationNumber)
      .send();
    expect(resp.status).toEqual(401);
  });

  it('se debe obtener resultado de historial de gastos', async () => {
    jest.spyOn(DenounceService.prototype, 'searchInsuredDenounces').mockImplementationOnce(async () => response);
    const resp = await request(app)
      .get(prefix + '/insured?rut=15456876-9&policy=282058&dateCode=1&page=1&limit=5')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.body.data).toHaveLength(3);
    expect(resp.body.recordTotal).toBe(3);
  });

  it('se debe obtener error en resultado de historial de gastos', async () => {
    jest.spyOn(DenounceService.prototype, 'searchInsuredDenounces').mockImplementationOnce(async () => {
      throw new Error('Error busqueda denuncio');
    });
    const resp = await request(app)
      .get(prefix + '/insured?rut=15456876-9&policy=282058&dateCode=1&page=1&limit=5')
      .set('Auth-Token', '12345')
      .send();
    expect(resp.status).toBe(500);
  });

  it('Se debe obtener el archivo xls de denuncios', async () => {
    const fileMockD = Buffer.from('');

    const somethingSpyD = jest.spyOn(DenounceService.prototype, 'generateXLSDenounce');
    somethingSpyD.mockImplementation(async () => fileMockD);
    const resp = await request(app)
      .get(
        prefix +
          '/excel?insuredRut=' +
          objRouteDenounceXLS.insuredRut +
          '&codeDate=' +
          objRouteDenounceXLS.codeDate +
          '&status=' +
          objRouteDenounceXLS.status +
          '&onlyMine=' +
          objRouteDenounceXLS.onlyMine
      )
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(200);
    expect(somethingSpyD).toHaveBeenCalledWith(iUserSSO, objRouteDenounceXLS);
  });

  it('Se debe obtener un error al llamar al archivo xls de denuncios', async () => {
    const somethingSpyE = jest.spyOn(DenounceService.prototype, 'generateXLSDenounce');
    somethingSpyE.mockImplementation(async () => {
      throw new Error('Error');
    });
    const resp = await request(app)
      .get(
        prefix +
          '/excel?insuredRut=' +
          objRouteDenounceXLS.insuredRut +
          '&codeDate=' +
          objRouteDenounceXLS.codeDate +
          '&status=' +
          objRouteDenounceXLS.status +
          '&onlyMine=' +
          objRouteDenounceXLS.onlyMine
      )
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(500);
    expect(somethingSpyE).toHaveBeenCalledWith(iUserSSO, objRouteDenounceXLS);
  });

  it('Se llama a servicio finDenounceFiles', async () => {
    const somethingSpyE = jest.spyOn(DenounceService.prototype, 'findDenounceFiles');
    somethingSpyE.mockImplementation(async () => response);
    const resp = await request(app)
      .get(prefix + '/file/backup/files?applicationNumber=123')
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(200);
    expect(somethingSpyE).toHaveBeenCalled();
  });

  it('Se llama a servicio deleteDenounceApplicationList', async () => {
    const somethingSpyE = jest.spyOn(DenounceService.prototype, 'deleteDenounceApplicationList');
    somethingSpyE.mockImplementation(async () => response);
    const resp = await request(app)
      .delete(prefix + '/application/list')
      .set('Auth-Token', '12345');
    expect(resp.status).toEqual(200);
    expect(somethingSpyE).toHaveBeenCalled();
  });
});
