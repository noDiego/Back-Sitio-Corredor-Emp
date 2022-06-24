export interface IInsuranceRequirement {
  idRequirement: number;
  policy?: number;
  insured: Insured;
  requestDate: Date;
  requestType: string;
  token: string;
  requirements: IRequirement[];
}

export interface Insured {
  id: number;
  rut: string;
  name: string;
  capital: number;
  subsidiary?: Subsidiary;
}

export interface Subsidiary {
  code?: number;
  rut?: number;
  name: string;
}

export interface IRequirement {
  type: string;
  name: string;
  status: string;
  receptionDate: Date;
  observacion: string;
}

export interface IInsuranceReqInput {
  rutInsurCo: number; //Rut de la Compañia Aseguradora
  rutBroker?: number; //Rut del Corredor
  rutCo?: number; //Rut de la Compañia
  policyNum?: number; //Numero de Poliza
  insuredRut?: number; //Rut Asegurado
}
