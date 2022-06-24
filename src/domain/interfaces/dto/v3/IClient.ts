export interface IAddress {
  type: string;
  adress: string;
  city: string;
  phoneNumber: string;
}

export interface IContact {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface IClient {
  code: number;
  rut: string;
  socialName: string;
  activity: string;
  businessActivity: string;
  address: IAddress;
  contacts: IContact[];
}
