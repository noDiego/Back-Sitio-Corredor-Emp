export interface Address {
  type: string;
  adress: string;
  city: string;
  phoneNumber: string;
}

export interface Contact {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Client {
  code: number;
  rut: string;
  dv: string;
  socialName: string;
  activity: string;
  businessActivity: string;
  address: Address[];
  contacts: Contact[];
}

export interface ClientDetailResponse {
  client: Client;
}
