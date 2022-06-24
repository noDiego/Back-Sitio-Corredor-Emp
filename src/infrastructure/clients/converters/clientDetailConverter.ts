import { IAddress, IClient } from '../../../domain/interfaces/dto/v3/IClient';
import { Client, Address } from '../dto/client';
import { ADDRESS_TYPE } from '../../../constants/types';
import { rutCreate } from '../../../utils/validators';

export default (client?: Client): IClient => {
  let clientAddress: IAddress = { adress: '', city: '', phoneNumber: '', type: '' };
  if (client.address)
    client.address.forEach((address: Address) => {
      if (address.type == ADDRESS_TYPE.MATRIZ) clientAddress = address;
    });

  return {
    activity: client.activity,
    address: clientAddress,
    businessActivity: client.businessActivity,
    code: client.code,
    contacts: client.contacts,
    rut: rutCreate(Number(client.rut), client.dv),
    socialName: client.socialName
  };
};
