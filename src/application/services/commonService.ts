import { Inject, Service } from 'typedi';
import { Ciudad, Comuna, ILocalidad } from '../../domain/interfaces/dto/v3/ILocalidad';
import { ICommonService } from '../../domain/interfaces/services/ICommonService';
import CommonApi from '../../infrastructure/clients/commonApi';
import { ICodeObject } from '../../domain/interfaces/dto/v3/ICodeObject';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import Utils from '../../utils/utils';
import { Logger } from '../../loaders/logger';

@Service('CommonService')
export default class CommonService implements ICommonService {
  @Inject('logger') private readonly logger: Logger;
  @Inject('CommonApi') private readonly commonApi: CommonApi;

  async listaRegiones(user: IUserSSO): Promise<ILocalidad[]> {
    const regionesList: ICodeObject[] = await this.commonApi.getCategories(Utils.REGIONCODECATEGORY, user);
    const ciudadesList: Ciudad[] = await this.commonApi.getCities(user);
    const comunasList: Comuna[] = await this.commonApi.getCommunes(user);
    const regiones: ILocalidad[] = [];

    regionesList.forEach((regElement: ICodeObject) => {
      const region: ILocalidad = {
        code: regElement.code,
        name: regElement.name,
        ciudades: []
      };
      const tempCiudades: Ciudad[] = ciudadesList.filter((ciudad: Ciudad) => ciudad.regCode === regElement.code);
      tempCiudades.forEach((ciudadElement: Ciudad) => {
        const ciudad: ILocalidad = {
          code: ciudadElement.code,
          name: ciudadElement.name,
          comunas: []
        };
        const tempComunas: Comuna[] = comunasList.filter((comuna: Comuna) => comuna.cityCode === ciudadElement.code);
        tempComunas.forEach((comunaElement: Comuna) => {
          const comuna: ILocalidad = {
            code: comunaElement.code,
            name: comunaElement.name
          };
          ciudad.comunas.push(comuna);
        });
        region.ciudades.push(ciudad);
      });

      regiones.push(region);
    });

    return regiones;
  }

  async listaBancos(user: IUserSSO): Promise<ICodeObject[]> {
    const bancos: ICodeObject[] = await this.commonApi.getCategories(Utils.BANKCODECATEGORY, user);
    return bancos;
  }

  async tiposCuenta(user: IUserSSO): Promise<ICodeObject[]> {
    const tipoCuentas: ICodeObject[] = await this.commonApi.getCategories(Utils.ACCOUNTTYPECODECATEGORY, user);
    return tipoCuentas;
  }

  async listaPrevisiones(user: IUserSSO): Promise<ICodeObject[]> {
    const previsiones: ICodeObject[] = await this.commonApi.getCategories(Utils.ISAPRECODECATEGORY, user);
    return previsiones;
  }
}
