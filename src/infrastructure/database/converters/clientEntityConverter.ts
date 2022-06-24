import { Client } from '../entities/client';
import { IClientDTO } from '../../../domain/interfaces/dto/administration/IClientDTO';
import { ClientType } from '../../../constants/types';

export default (clientEntity?: Client): IClientDTO => {
  return {
    name: clientEntity.name,
    policies: clientEntity.policies,
    rut: clientEntity.rut,
    seeAll: clientEntity.seeAll,
    status: clientEntity.status,
    type: Number(clientEntity.type) == 0 ? ClientType.BROKER : ClientType.COMPANY
  };
};
