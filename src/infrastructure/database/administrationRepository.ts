import { Inject, Service } from 'typedi';
import { IUserDTO } from '../../domain/interfaces/dto/administration/IUserDTO';
import rutjs from 'rut.js';
import { IFunctionalityDTO } from '../../domain/interfaces/dto/administration/IFunctionalityDTO';
import { IError } from '../../utils/interfaces/IError';
import { IResponseDTO } from '../../utils/interfaces/IResponse';
import { Functionality } from './entities/functionality';
import { Profile } from './entities/profile';
import { getManager, EntityManager, DeleteResult } from 'typeorm';
import { IProfileDTO } from '../../domain/interfaces/dto/administration/IProfileDTO';
import { Client } from './entities/client';
import { User } from './entities/user';
import userEntityConverter from './converters/userEntityConverter';
import profileEntityConverter from './converters/profileEntityConverter';
import functionalityEntityConverter from './converters/functionalityEntityConverter';
import { IAdministrationRepository } from '../../domain/interfaces/adapter/IAdministrationRepository';
import { ClientType } from '../../constants/types';
import { trackSQL } from '../../loaders/insight';
import { Logger } from 'winston';
import { IClientDTO } from '../../domain/interfaces/dto/administration/IClientDTO';

@Service('AdministrationRepository')
export default class AdministrationRepository implements IAdministrationRepository {
  @Inject('logger') private readonly logger: Logger;
  private readonly entityManager: EntityManager = getManager();

  async insertUser(userInput: IUserDTO): Promise<IUserDTO> {
    this.validaRutsUser(userInput);
    const clientsEntity: Client[] = [];
    for (const clientInput of userInput.clients) {
      const client: Client = new Client();
      client.rut = rutjs.format(clientInput.rut);
      client.name = clientInput.name;
      client.policies = clientInput.policies;
      client.seeAll = clientInput.seeAll;
      client.status = clientInput.status;
      client.type = String(ClientType.BROKER.valueOf());
      const clientEntity: Client = await this.entityManager.save(Client, client);
      clientsEntity.push(clientEntity);
    }
    const profiles: Profile[] = await this.entityManager.findByIds(Profile, userInput.profiles);

    const user: User = new User();
    user.profiles = profiles;
    user.clients = clientsEntity;
    user.email = userInput.email;
    user.status = userInput.status;
    user.name = userInput.name;
    user.type = userInput.type;
    user.rut = rutjs.format(userInput.rut);
    const startTime: number = Date.now();
    const userSaved: User = await this.entityManager.save(User, user);
    trackSQL({ user: user }, 'insertUser', userSaved, startTime);
    return userEntityConverter(userSaved);
  }

  async deleteUser(rut: string): Promise<IResponseDTO> {
    const startTime: number = Date.now();
    if (!rutjs.validate(rut)) {
      throw new Error('Rut invalido');
    }
    const response: DeleteResult = await this.entityManager.delete(User, { rut: rutjs.format(rut) });
    trackSQL({ rut: rut }, 'deleteUser', response, startTime);
    if (response.affected < 1) {
      throw new IError('Error al eliminar User', 'UpdateError', 1);
    }
    return { code: 0, message: 'OK' };
  }

  async updateUser(userInput: IUserDTO): Promise<IUserDTO> {
    this.validaRutsUser(userInput);
    const user: User = await this.entityManager.findOne(
      User,
      { rut: rutjs.format(userInput.rut) },
      { relations: ['profiles', 'clients'] }
    );

    await this.entityManager.delete(Client, { userId: user.id });

    const clientsEntity: Client[] = [];
    for (const clientInput of userInput.clients) {
      const client: Client = new Client();
      client.rut = rutjs.format(clientInput.rut);
      client.name = clientInput.name;
      client.seeAll = clientInput.seeAll;
      client.policies = clientInput.policies;
      client.type = String(ClientType.BROKER.valueOf());
      client.status = clientInput.status;
      const clientEntity: Client = await this.entityManager.save(Client, client);
      clientsEntity.push(clientEntity);
    }

    const profiles: Profile[] = await this.entityManager.findByIds(Profile, userInput.profiles);

    user.clients = clientsEntity;
    user.email = userInput.email;
    user.profiles = profiles;
    user.status = userInput.status;
    user.name = userInput.name;
    user.rut = rutjs.format(userInput.rut);
    const startTime: number = Date.now();

    const userUpdated: User = await this.entityManager.save(User, user);
    trackSQL({ user: user }, 'updateUser', userUpdated, startTime);
    return userEntityConverter(userUpdated);
  }

  async getUserData(rut: string): Promise<IUserDTO> {
    const startTime: number = Date.now();
    try {
      const user: User = await this.entityManager.findOne(
        User,
        { rut: rutjs.format(rut) },
        { relations: ['profiles', 'clients'] }
      );
      trackSQL({ rut: rut }, 'getUserData', user, startTime);
      return userEntityConverter(user);
    } catch (e) {
      throw new Error('Error al leer datos de Usuario en BD. Error: ' + e.message);
    }
  }

  async insertProfile(profile: IProfileDTO): Promise<IProfileDTO> {
    try {
      const profileEntity: Profile = new Profile();
      profileEntity.functionalities = await this.entityManager.findByIds(Functionality, profile.functionalities);
      profileEntity.description = profile.description;
      profileEntity.status = profile.status;

      const startTime: number = Date.now();
      const profileSaved: Profile = await this.entityManager.save(Profile, profileEntity);
      trackSQL({ profile: profileEntity }, 'insertProfile', profileSaved, startTime);
      return profileEntityConverter(profileSaved);
    } catch (e) {
      throw new Error('Error al ingresar datos de Perfil en BD. Error: ' + e.message);
    }
  }

  async getProfiles(): Promise<IProfileDTO[]> {
    const startTime: number = Date.now();
    try {
      const profiles: Profile[] = await this.entityManager.find(Profile, { relations: ['functionalities'] });
      trackSQL({}, 'getProfiles', profiles, startTime);
      const profilesDTO: IProfileDTO[] = [];
      profiles.forEach((p: Profile) => {
        profilesDTO.push(profileEntityConverter(p));
      });
      return profilesDTO;
    } catch (e) {
      throw new Error('Error al leer datos de Perfil en BD. Error: ' + e.message);
    }
  }

  async updateProfile(profileInput: IProfileDTO): Promise<IProfileDTO> {
    try {
      const profileObject: Profile = await this.entityManager.findOne(Profile, profileInput.id, {
        relations: ['functionalities']
      });
      profileObject.status = profileInput.status;
      profileObject.description = profileInput.description;
      profileObject.functionalities = await this.entityManager.findByIds(Functionality, profileInput.functionalities);

      const startTime: number = Date.now();
      const profileUpdated: Profile = await this.entityManager.save(Profile, profileObject);
      trackSQL({ profile: profileObject }, 'updateProfile', profileUpdated, startTime);
      return profileEntityConverter(profileUpdated);
    } catch (e) {
      throw new Error('Error al actualizar datos de Perfil en BD. Error: ' + e.message);
    }
  }

  async deleteProfile(id: number): Promise<IResponseDTO> {
    const startTime: number = Date.now();
    try {
      const response: DeleteResult = await this.entityManager.delete(Profile, id);
      trackSQL({ id: id }, 'deleteProfile', response, startTime);
      return { code: response.affected - 1, message: response.affected ? 'OK' : 'NO OK' };
    } catch (e) {
      throw new Error('Error al eliminar datos de Perfil en BD. Error: ' + e.message);
    }
  }

  async insertFunctionality(input: IFunctionalityDTO): Promise<IFunctionalityDTO> {
    try {
      const funcEntityObject: Functionality = new Functionality();
      funcEntityObject.description = input.description;

      const startTime: number = Date.now();
      const functionalitySaved: Functionality = await this.entityManager.save(Functionality, funcEntityObject);
      trackSQL({ functionality: funcEntityObject }, 'insertFunctionality', functionalitySaved, startTime);
      return functionalityEntityConverter(functionalitySaved);
    } catch (e) {
      throw new Error('Error al ingresar datos de Funcionalidad en BD. Error: ' + e.message);
    }
  }

  async getFunctionalities(): Promise<IFunctionalityDTO[]> {
    const startTime: number = Date.now();
    try {
      const functionalities: Functionality[] = await this.entityManager.find(Functionality);
      trackSQL({}, 'getFunctionalities', functionalities, startTime);
      const functionalitiesDTO: IFunctionalityDTO[] = [];
      functionalities.forEach((f: Functionality) => {
        functionalitiesDTO.push(functionalityEntityConverter(f));
      });

      return functionalitiesDTO;
    } catch (e) {
      throw new Error('Error al leer datos de Funcionalidad en BD. Error: ' + e.message);
    }
  }

  async updateFunctionality(functionality: IFunctionalityDTO): Promise<IFunctionalityDTO> {
    const functionalityEntity: Functionality = await this.entityManager.findOne(Functionality, functionality.code);
    functionalityEntity.description = functionality.description;
    functionalityEntity.status = functionality.status;
    const startTime: number = Date.now();
    const functionalityUpdated: Functionality = await this.entityManager.save(Functionality, functionalityEntity);
    trackSQL({ functionality: functionalityEntity }, 'updateFunctionality', functionalityUpdated, startTime);
    return functionalityEntityConverter(functionalityUpdated);
  }

  async deleteFunctionality(code: string): Promise<IResponseDTO> {
    const startTime: number = Date.now();
    try {
      const response: DeleteResult = await this.entityManager.delete(Functionality, code);
      trackSQL({ code: code }, 'deleteFunctionality', response, startTime);
      return { code: response.affected - 1, message: response.affected ? 'OK' : 'NO OK' };
    } catch (e) {
      throw new Error('Error al eliminar datos de Funcionalidad en BD. Error: ' + e.message);
    }
  }

  private validaRutsUser(user: IUserDTO): void {
    user.clients.forEach((client: IClientDTO) => {
      if (!rutjs.validate(client.rut)) {
        throw new IError('Rut de cliente invalido: ' + client.rut, 'RutError', 99);
      }
    });

    if (!rutjs.validate(user.rut)) {
      throw new IError('Rut de Usuario invalido', 'RutError', 99);
    }
  }
}
