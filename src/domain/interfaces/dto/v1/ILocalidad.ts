export interface Comuna {
  code: string;
  cityCode: string;
  name: string;
}

export interface Ciudad {
  code: string;
  regCode: string;
  name: string;
}

export interface Region {
  code: string;
  name: string;
}

export interface ILocalidad {
  code: string;
  name: string;
  comunas?: ILocalidad[];
  ciudades?: ILocalidad[];
}
