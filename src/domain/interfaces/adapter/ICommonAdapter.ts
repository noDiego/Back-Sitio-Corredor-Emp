import { IUserSSO } from '../dto/v3/IUserSSO';
import { ICodeObject } from '../dto/v3/ICodeObject';

export interface ICommonAdapter {
  getCategories(categorieCode: string, userSSO: IUserSSO): Promise<ICodeObject[]>;
  getCities(userSSO: IUserSSO): Promise<any[]>;
  getCommunes(userSSO: IUserSSO): Promise<any[]>;
  getFileToken(token: number, userSSO: IUserSSO): Promise<any>;
}
