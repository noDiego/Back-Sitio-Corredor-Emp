import express from 'express';
import request from 'supertest';
import { startGlobals } from '../../helpers/globalMocks';
import CommissionService from "../../../src/application/services/commissionService";

const app = express();
const prefix = '/v1/commission';

const responsePeriods =
    {
        code: 0,
        data: [
            {
                code: "2019",
                name: "2019",
                months: [
                    {
                        code: "01",
                        name: "Enero"
                    }
                ]
            }
        ],
        message: "OK"
    };

const responseInterCodes =
    {
        code: 0,
        data: [
            {
                code: '00007777',
                name: 'Intermediary Name One',
                type: '1'
            }
        ],
        message: "OK"
    };

describe('Commission Route', () => {
    beforeAll(async () => {
        await startGlobals(app, true);
    });

    it('debe cargar periodos', async () => {
        jest.spyOn(CommissionService.prototype, 'searchCommissionPeriods').mockImplementationOnce(async () => responsePeriods);

        const resp = await request(app)
            .get(prefix + '/periods?intermediaryCode=281874')
            .set('Auth-Token', '12345')
            .send();
        expect(resp.body.data).toHaveLength(1);
    });

    it('debe arrojar error en periodos', async () => {

        jest.spyOn(CommissionService.prototype, 'searchCommissionPeriods').mockImplementationOnce(async () => {
            throw {
                code: -1,
                message: `test`,
                serviceName: 'serviceName',
                status: 500,
                stack: new Error('TestE')
            };
        });

        const resp = await request(app)
            .get(prefix + '/periods?intermediaryCode=281874')
            .set('Auth-Token', '12345')
            .send();
        expect(resp.body).toBeDefined();
        expect(resp.body.error).toBeDefined();
        expect(resp.body.error.code).toBe(-1);
        expect(resp.body.error.message).toBe('test');


    });

    it('debe cargar intermediarios', async () => {
        jest.spyOn(CommissionService.prototype, 'searchIntermediaryCode').mockImplementationOnce(async () => responseInterCodes);

        const resp = await request(app)
            .get(prefix + '/intermediary')
            .set('Auth-Token', '12345')
            .send();
        expect(resp.body.data).toHaveLength(1);
    });
});
