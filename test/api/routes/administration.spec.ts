import express from 'express';
import request from 'supertest';
import { IToken } from '../../../src/domain/interfaces/dto/v3/IToken';
import { startGlobals } from '../../helpers/globalMocks';
import AdministrationRepository from '../../../src/infrastructure/database/administrationRepository';
import { IUserDTO } from '../../../src/domain/interfaces/dto/administration/IUserDTO';
import { IFunctionalityDTO } from '../../../src/domain/interfaces/dto/administration/IFunctionalityDTO';
import { IProfileDTO } from '../../../src/domain/interfaces/dto/administration/IProfileDTO';
import { IResponseDTO } from '../../../src/utils/interfaces/IResponse';

const app = express();
const prefix = '/v1/admin';

const iTokenObj: IToken = {
  accessToken: '12345',
  expiresIn: 1,
  refreshExpiresIn: 1,
  refreshToken: 'string',
  tokenType: 'string',
  idToken: 'string',
  notBeforePolicy: 1,
  sessionState: 'string'
};

const userDTO: IUserDTO = {
  rut: '11.111.111-1',
  name: 'Juan Perez',
  email: 'test@test.cl',
  clients: [
    {
      policies: ['281874'],
      seeAll: false,
      status: 'ENABLED',
      rut: '79.587.210-8',
      name: 'MINERA ESCONDIDA LTDA',
      type: null
    }
  ],
  type: '0',
  status: 'enabled',
  profiles: [4, 5, 6]
};

const functionalityDTO: IFunctionalityDTO = {
  code: 1,
  description: 'desc',
  status: 'ENABLED'
};

const profileDTO: IProfileDTO = {
  description: 'desc',
  functionalities: [],
  id: 0,
  status: 'ENABLED'
};

const responseOK: IResponseDTO = {
  code: 0,
  message: 'OK'
};

describe('Administration Route', () => {
  beforeAll(async () => {
    await startGlobals(app, true);
  });

  it('insertUser', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'insertUser').mockImplementationOnce(async () => userDTO);

    const resp = await request(app)
      .post(prefix + '/user')
      .set('Auth-Code', '12345')
      .send(userDTO);
    expect(resp.body.rut).toBe(userDTO.rut);
  });

  it('getUserData', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementationOnce(async () => userDTO);

    const resp = await request(app)
      .get(prefix + '/user?rut=11.111.111-1')
      .set('Auth-Code', '12345')
      .send();
    expect(resp.body.rut).toBe(userDTO.rut);
  });
  /*
  it('deleteUser', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'deleteUser').mockImplementationOnce(async () => responseOK);

    const resp = await request(app)
      .delete(prefix + '/user')
      .set('Auth-Code', '12345')
      .send({ rut: '11.111.111-1' });
    expect(resp.body.planCode).toBe(0);
  });
*/
  it('putUser', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'updateUser').mockImplementationOnce(async () => userDTO);

    const resp = await request(app)
      .put(prefix + '/user')
      .set('Auth-Code', '12345')
      .send({ rut: '11.111.111-1' });
    expect(resp.body.rut).toBe(userDTO.rut);
  });

  it('insertProfile', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'insertProfile').mockImplementationOnce(async () => profileDTO);

    const resp = await request(app)
      .post(prefix + '/profile')
      .set('Auth-Code', '12345')
      .send(profileDTO);
    expect(resp.body.status).toBe(profileDTO.status);
  });

  it('getProfiles', async () => {
    jest
      .spyOn(AdministrationRepository.prototype, 'getProfiles')
      .mockImplementationOnce(async () => [profileDTO, profileDTO]);

    const resp = await request(app)
      .get(prefix + '/profile')
      .set('Auth-Code', '12345')
      .send();
    expect(resp.body[0].status).toBe(profileDTO.status);
    expect(resp.body).toHaveLength(2);
  });
  /*
  it('deleteProfile', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'deleteProfile').mockImplementationOnce(async () => responseOK);

    const resp = await request(app)
      .delete(prefix + '/profile')
      .set('Auth-Code', '12345')
      .send({ rut: '11.111.111-1' });
    expect(resp.body.planCode).toBe(0);
  });
*/
  it('updateProfile', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'updateProfile').mockImplementationOnce(async () => profileDTO);

    const resp = await request(app)
      .put(prefix + '/profile')
      .set('Auth-Code', '12345')
      .send({ rut: '11.111.111-1' });
    expect(resp.body.status).toBe(profileDTO.status);
  });

  it('insertFunctionality', async () => {
    jest
      .spyOn(AdministrationRepository.prototype, 'insertFunctionality')
      .mockImplementationOnce(async () => functionalityDTO);

    const resp = await request(app)
      .post(prefix + '/functionality')
      .set('Auth-Code', '12345')
      .send(functionalityDTO);
    expect(resp.body.status).toBe(functionalityDTO.status);
  });

  it('getProfiles', async () => {
    jest
      .spyOn(AdministrationRepository.prototype, 'getFunctionalities')
      .mockImplementationOnce(async () => [functionalityDTO, functionalityDTO]);

    const resp = await request(app)
      .get(prefix + '/functionality')
      .set('Auth-Code', '12345')
      .send();
    expect(resp.body[0].status).toBe(functionalityDTO.status);
    expect(resp.body).toHaveLength(2);
  });
  /*
  it('deleteFunctionality', async () => {
    jest
      .spyOn(AdministrationRepository.prototype, 'deleteFunctionality')
      .mockImplementationOnce(async () => responseOK);

    const resp = await request(app)
      .delete(prefix + '/functionality')
      .set('Auth-Code', '12345')
      .send({ rut: '11.111.111-1' });
    expect(resp.body.planCode).toBe(0);
  });
*/
  it('updateFunctionality', async () => {
    jest
      .spyOn(AdministrationRepository.prototype, 'updateFunctionality')
      .mockImplementationOnce(async () => functionalityDTO);

    const resp = await request(app)
      .put(prefix + '/functionality')
      .set('Auth-Code', '12345')
      .send({ code: '0', description: 'desc', status: 0 });
    expect(resp.body.status).toBe(functionalityDTO.status);
  });

  //ERRORS

  it('insertUser ERROR', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'insertUser').mockImplementationOnce(async () => {
      throw new Error('Test');
    });

    try {
      await request(app)
        .post(prefix + '/user')
        .set('Auth-Code', '12345')
        .send(userDTO);
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('getUserData Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'getUserData').mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    try {
      await request(app)
        .get(prefix + '/user?rut=11.111.111-1')
        .set('Auth-Code', '12345')
        .send();
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('deleteUser Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'deleteUser').mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    try {
      await request(app)
        .delete(prefix + '/user')
        .set('Auth-Code', '12345')
        .send({ rut: '11.111.111-1' });
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('putUser Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'updateUser').mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    try {
      await request(app)
        .put(prefix + '/user')
        .set('Auth-Code', '12345')
        .send({ rut: '11.111.111-1' });
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('insertProfile Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'insertProfile').mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    try {
      const resp = await request(app)
        .post(prefix + '/profile')
        .set('Auth-Code', '12345')
        .send(profileDTO);
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('getProfiles Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'getProfiles').mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    try {
      const resp = await request(app)
        .get(prefix + '/profile')
        .set('Auth-Code', '12345')
        .send();
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('deleteProfile Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'deleteProfile').mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    try {
      const resp = await request(app)
        .delete(prefix + '/profile')
        .set('Auth-Code', '12345')
        .send({ rut: '11.111.111-1' });
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('updateProfile Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'updateProfile').mockImplementationOnce(async () => {
      throw new Error('Test');
    });

    try {
      const resp = await request(app)
        .put(prefix + '/profile')
        .set('Auth-Code', '12345')
        .send({ rut: '11.111.111-1' });
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('insertFunctionality Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'insertFunctionality').mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    try {
      await request(app)
        .post(prefix + '/functionality')
        .set('Auth-Code', '12345')
        .send(functionalityDTO);
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('getProfiles Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'getFunctionalities').mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    try {
      await request(app)
        .get(prefix + '/functionality')
        .set('Auth-Code', '12345')
        .send();
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('deleteFunctionality Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'deleteFunctionality').mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    try {
      await request(app)
        .delete(prefix + '/functionality')
        .set('Auth-Code', '12345')
        .send({ rut: '11.111.111-1' });
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });

  it('updateFunctionality Error', async () => {
    jest.spyOn(AdministrationRepository.prototype, 'updateFunctionality').mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    try {
      await request(app)
        .put(prefix + '/functionality')
        .set('Auth-Code', '12345')
        .send({ code: '0', description: 'desc', status: 0 });
    } catch (e) {
      expect(e.message).toBe('Test');
    }
  });
});
