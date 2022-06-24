import { IUserDTO } from '../../../domain/interfaces/dto/administration/IUserDTO';
import { User } from '../entities/user';
import clientEntityConverter from './clientEntityConverter';
import { IClientDTO } from '../../../domain/interfaces/dto/administration/IClientDTO';
import { Client } from '../entities/client';
import { Profile } from '../entities/profile';

export default (userEntity: User): IUserDTO => {
  const profilesIds: number[] = [];
  userEntity.profiles.forEach((profile: Profile) => {
    profilesIds.push(profile.id);
  });

  const clients: IClientDTO[] = [];
  userEntity.clients.forEach((client: Client) => {
    clients.push(clientEntityConverter(client));
  });
  return {
    clients: clients,
    email: userEntity.email,
    name: userEntity.name,
    profiles: profilesIds,
    rut: userEntity.rut,
    status: userEntity.status,
    type: userEntity.type
  };
};
