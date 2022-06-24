import { ILocalidad } from '../dto/v1/ILocalidad';
import { ICodeObject } from '../dto/v3/ICodeObject';
import { IUserSSO } from '../dto/v3/IUserSSO';

export interface ICommonService {
  listaRegiones(user: IUserSSO): Promise<ILocalidad[]>;

  listaBancos(user: IUserSSO): Promise<ICodeObject[]>;

  tiposCuenta(user: IUserSSO): Promise<ICodeObject[]>;

  listaPrevisiones(user: IUserSSO): Promise<ICodeObject[]>;
}
