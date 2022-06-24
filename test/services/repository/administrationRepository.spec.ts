import { startGlobals } from '../../helpers/globalMocks';
import { Container } from 'typedi';
import AdministrationRepository from '../../../src/infrastructure/database/administrationRepository';
import { IUserDTO } from '../../../src/domain/interfaces/dto/administration/IUserDTO';
import { Client } from '../../../src/infrastructure/database/entities/client';
import { Profile } from '../../../src/infrastructure/database/entities/profile';
import { User } from '../../../src/infrastructure/database/entities/user';
import { IProfileDTO } from '../../../src/domain/interfaces/dto/administration/IProfileDTO';
import { Functionality } from '../../../src/infrastructure/database/entities/functionality';
import { IFunctionalityDTO } from '../../../src/domain/interfaces/dto/administration/IFunctionalityDTO';
import { IAdministrationRepository } from '../../../src/domain/interfaces/adapter/IAdministrationRepository';
import typeorm = require('typeorm');

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

const userEntity: User = {
  id: 1,
  profiles: [
    {
      description: 'desc',
      functionalities: [],
      id: 0,
      status: 'ENABLED'
    }
  ],
  clients: [
    {
      id: 0,
      rut: '79.587.210-8',
      name: 'MINERA ESCONDIDA LTDA',
      policies: ['281874'],
      seeAll: false,
      status: 'ENABLED',
      type: null
    }
  ],
  email: 'test@test.cl',
  status: 'enabled',
  name: 'Juan Perez',
  type: '0',
  rut: '11.111.111-1'
};

const clientEntity: Client = {
  id: 0,
  rut: '79.587.210-8',
  name: 'MINERA ESCONDIDA LTDA',
  policies: ['281874'],
  seeAll: false,
  status: 'ENABLED',
  type: null
};

const functionality: Functionality = {
  code: 1,
  description: 'desc',
  status: 'ENABLED'
};

const functionalityDTO: IFunctionalityDTO = {
  code: 1,
  description: 'desc',
  status: 'ENABLED'
};

const profile: Profile = {
  description: 'desc',
  functionalities: [],
  id: 0,
  status: 'ENABLED'
};

const profileDTO: IProfileDTO = {
  description: 'desc',
  functionalities: [],
  id: 0,
  status: 'ENABLED'
};

describe('Administration Repository Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    startGlobals(null, true);
  });

  afterEach(() => {
    Container.remove(AdministrationRepository);
  });

  const administrationManager = {
    //Mock de getRepository para payroll
    save: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findByIds: jest.fn().mockReturnThis(),
    findAndCount: jest.fn().mockReturnThis()
  };

  it('AdministrationRepository define OK', () => {
    const adminRepo: AdministrationRepository = Container.get(AdministrationRepository);
    expect(adminRepo).toBeDefined();
  });

  it('insertUser OK', async () => {
    administrationManager.save = jest.fn().mockReturnValueOnce(clientEntity).mockReturnValueOnce(userEntity);
    administrationManager.findByIds = jest.fn().mockReturnValueOnce([profile]);
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const response = await adminRepo.insertUser(userDTO);

    expect(administrationManager.save).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(userDTO.status);
  });

  it('deleteUser OK', async () => {
    administrationManager.delete = jest.fn().mockReturnValueOnce({ affected: 1 });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const rut = '11111111-1';

    const response = await adminRepo.deleteUser(rut);

    expect(administrationManager.delete).toHaveBeenCalled();
    expect(response.code).toBe(0);
    expect(response.message).toBe('OK');
  });

  it('deleteUser ERROR', async () => {
    administrationManager.delete = jest.fn().mockReturnValueOnce({ affected: 0 });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const rut = '11111111-1';

    await adminRepo.deleteUser(rut).catch((e) => {
      expect(e.name).toBe('UpdateError');
    });

    expect(administrationManager.delete).toHaveBeenCalled();
  });

  it('deleteUser Rut Invalido', async () => {
    administrationManager.delete = jest.fn().mockReturnValueOnce({ affected: 1 });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const rut = '5123';

    await adminRepo.deleteUser(rut).catch((e) => {
      expect(e.message).toBe('Rut invalido');
    });
  });

  it('update OK', async () => {
    administrationManager.findOne = jest.fn().mockReturnValueOnce(userEntity);
    administrationManager.delete = jest.fn().mockReturnValueOnce({ affected: 1 });
    administrationManager.findByIds = jest.fn().mockReturnValueOnce([profile]);
    administrationManager.save = jest.fn().mockReturnValueOnce(clientEntity).mockReturnValueOnce(userEntity);
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const response = await adminRepo.updateUser(userDTO);

    expect(administrationManager.save).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(userDTO.status);
  });

  it('getUserData OK', async () => {
    administrationManager.findOne = jest.fn().mockReturnValueOnce(userEntity);
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const response = await adminRepo.getUserData('11.111.111-1');

    expect(administrationManager.findOne).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(userDTO.status);
  });

  it('getUserData Error', async () => {
    administrationManager.findOne = jest.fn().mockImplementation(async () => {
      throw new Error('Test');
    });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    await adminRepo.getUserData('11.111.111-1').catch((error) => {
      expect(error.message).toBe('Error al leer datos de Usuario en BD. Error: Test');
    });
  });

  it('insertProfile OK', async () => {
    administrationManager.save = jest.fn().mockReturnValueOnce(profile);
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const responseProfile = await adminRepo.insertProfile(profileDTO);

    expect(administrationManager.save).toHaveBeenCalledTimes(1);
    expect(responseProfile.status).toBe(profile.status);
  });

  it('insertProfile Error', async () => {
    administrationManager.save = jest.fn().mockImplementation(async () => {
      throw new Error('Test');
    });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    await adminRepo.insertProfile(profileDTO).catch((error) => {
      expect(error.message).toBe('Error al ingresar datos de Perfil en BD. Error: Test');
    });
  });

  it('getProfiles OK', async () => {
    administrationManager.find = jest.fn().mockReturnValueOnce([profile, profile]);
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const responseProfiles = await adminRepo.getProfiles();

    expect(administrationManager.find).toHaveBeenCalledTimes(1);
    expect(responseProfiles[0].id).toBe(profile.id);
    expect(responseProfiles).toHaveLength(2);
  });

  it('getProfiles ERROR', async () => {
    administrationManager.find = jest.fn().mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    adminRepo.getProfiles().catch((error) => {
      expect(error.message).toBe('Error al leer datos de Perfil en BD. Error: ' + 'Test');
    });

    expect(administrationManager.find).toHaveBeenCalledTimes(1);
  });

  it('updateProfile OK', async () => {
    administrationManager.findOne = jest.fn().mockReturnValueOnce([profile, profile]);
    administrationManager.findByIds = jest.fn().mockReturnValueOnce([functionality, functionality]);
    administrationManager.save = jest.fn().mockReturnValueOnce(profile);
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const responseProfile = await adminRepo.updateProfile(profileDTO);

    expect(administrationManager.findOne).toHaveBeenCalledTimes(1);
    expect(administrationManager.findByIds).toHaveBeenCalledTimes(1);
    expect(administrationManager.save).toHaveBeenCalledTimes(1);
    expect(responseProfile.id).toBe(profile.id);
  });

  it('updateProfile ERROR', async () => {
    administrationManager.findOne = jest.fn().mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    await adminRepo.updateProfile(profileDTO).catch((e) => {
      expect(e.message).toBe('Error al actualizar datos de Perfil en BD. Error: Test');
    });

    expect(administrationManager.findOne).toHaveBeenCalledTimes(1);
  });

  it('deleteProfile OK', async () => {
    administrationManager.delete = jest.fn().mockReturnValueOnce({ affected: 1 });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const responseProfile = await adminRepo.deleteProfile(profileDTO.id);

    expect(administrationManager.delete).toHaveBeenCalledTimes(1);
    expect(responseProfile.code).toBe(0);
  });

  it('deleteProfile ERROR', async () => {
    administrationManager.delete = jest.fn().mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    adminRepo.deleteProfile(profileDTO.id).catch((e) => {
      expect(e.message).toBe('Error al eliminar datos de Perfil en BD. Error: Test');
    });
    expect(administrationManager.delete).toHaveBeenCalledTimes(1);
  });

  it('insertFunctionality OK', async () => {
    administrationManager.save = jest.fn().mockReturnValueOnce(functionality);
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const responseProfile = await adminRepo.insertFunctionality(functionalityDTO);

    expect(administrationManager.save).toHaveBeenCalledTimes(1);
    expect(responseProfile.description).toBe(functionality.description);
  });

  it('insertFunctionality ERROR', async () => {
    administrationManager.save = jest.fn().mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    adminRepo.insertFunctionality(functionalityDTO).catch((e) => {
      expect(e.message).toBe('Error al ingresar datos de Funcionalidad en BD. Error: Test');
    });

    expect(administrationManager.save).toHaveBeenCalledTimes(1);
  });

  it('getFunctionalities OK', async () => {
    administrationManager.find = jest.fn().mockReturnValueOnce([functionality, functionality]);
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const response = await adminRepo.getFunctionalities();

    expect(administrationManager.find).toHaveBeenCalledTimes(1);
    expect(response).toHaveLength(2);
    expect(response[0].description).toBe(functionality.description);
  });

  it('getFunctionalities ERROR', async () => {
    administrationManager.find = jest.fn().mockImplementationOnce(() => {
      throw new Error('Test');
    });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    try {
      await adminRepo.getFunctionalities();
    } catch (e) {
      expect(e.message).toBe('Error al leer datos de Funcionalidad en BD. Error: Test');
    }
  });

  it('updateFunctionality OK', async () => {
    administrationManager.findOne = jest.fn().mockReturnValueOnce(functionality);
    administrationManager.save = jest.fn().mockReturnValueOnce(functionality);
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const response = await adminRepo.updateFunctionality(functionalityDTO);

    expect(administrationManager.findOne).toHaveBeenCalledTimes(1);
    expect(administrationManager.save).toHaveBeenCalledTimes(1);
  });

  it('updateFunctionality ERROR', async () => {
    administrationManager.findOne = jest.fn().mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    adminRepo.updateFunctionality(functionalityDTO).catch((e) => {
      expect(e.message).toBe('Error al leer datos de Funcionalidad en BD. Error: Test');
    });

    expect(administrationManager.findOne).toHaveBeenCalledTimes(1);
  });

  it('deleteFunctionality OK', async () => {
    administrationManager.delete = jest.fn().mockReturnValueOnce({ affected: 1 });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const response = await adminRepo.deleteFunctionality(String(functionalityDTO.code));

    expect(administrationManager.delete).toHaveBeenCalledTimes(1);
    expect(response.message).toBe('OK');
    expect(response.code).toBe(0);
  });

  it('deleteFunctionality Error1', async () => {
    administrationManager.delete = jest.fn().mockReturnValueOnce({ affected: 0 });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    const response = await adminRepo.deleteFunctionality(String(functionalityDTO.code));

    expect(administrationManager.delete).toHaveBeenCalledTimes(1);
    expect(response.code).toBe(-1);
    expect(response.message).toBe('NO OK');
  });

  it('deleteFunctionality ERROR', async () => {
    administrationManager.delete = jest.fn().mockImplementationOnce(async () => {
      throw new Error('Test');
    });
    typeorm.getManager = jest.fn().mockReturnValue(administrationManager);
    const adminRepo: IAdministrationRepository = Container.get(AdministrationRepository);

    adminRepo.deleteFunctionality(String(functionalityDTO.code)).catch((e) => {
      expect(e.message).toBe('Error al eliminar datos de Funcionalidad en BD. Error: Test');
    });

    expect(administrationManager.delete).toHaveBeenCalledTimes(1);
  });
});
