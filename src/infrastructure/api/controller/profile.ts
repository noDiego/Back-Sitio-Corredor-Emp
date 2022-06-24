import { NextFunction, Request, Response } from 'express';
import CommonApi from '../../clients/commonApi';
import { Container } from 'typedi';
import { trackRequest } from '../../../loaders/insight';
import { AxiosRequestConfig } from 'axios';
import { getVSHeaders } from '../../../constants/headers';
import AdministrationRepository from '../../database/administrationRepository';
import { IUserDTO } from '../../../domain/interfaces/dto/administration/IUserDTO';
import { IRedisClient } from '../../../loaders/redis';
import { ICodeObject } from '../../../domain/interfaces/dto/v3/ICodeObject';
import config from '../../../config';
import SsoService from '../../../application/services/ssoService';
import SsoClient from '../../clients/ssoClient';

export default class ProfileController {
  public async test(req: Request, res: Response, next: NextFunction): Promise<Response> {
    const tests: string[] = [];
    try {
      //CONSULTA BD
      const commonApi: CommonApi = Container.get(CommonApi);
      try {
        const administrationRepository: AdministrationRepository = Container.get(AdministrationRepository);
        const userDTO: IUserDTO = await administrationRepository.getUserData('11111111-1');
        tests.push('user 11111111-1 query a BD resp: ' + JSON.stringify(userDTO));
      } catch (e) {
        tests.push('Error en consulta de BD user: ' + e.message);
      }

      try {
        //CACHE
        const redisClient: IRedisClient = Container.get('RedisClient');
        const axiosRequest: AxiosRequestConfig = {
          method: 'get',
          url: 'https://httpbin.org/get',
          headers: getVSHeaders(req.currentUser),
          params: { testParam: '123' }
        };

        const cachedData: any = redisClient.getCache(axiosRequest);
        if (cachedData && cachedData != {}) {
          tests.push('Data cacheada OK: ' + JSON.stringify(cachedData));
        } else {
          tests.push('Seteando cache : ' + JSON.stringify(cachedData));
          const resp: boolean = await redisClient.setCache({ dataTest: '123' }, axiosRequest);
          tests.push('Cache Set response: ' + resp);
        }
      } catch (e) {}

      //SERVICIO
      try {
        const bancos: ICodeObject[] = await commonApi.getCategories('BANCOS', req.currentUser);
        tests.push('Bancos: ' + JSON.stringify(bancos));
      } catch (e) {
        tests.push('Error al conseguir bancos: ' + e.message);
      }

      //VAraibles entorno

      return res.status(200).json({ tests: tests, variables: config });
    } catch (e) {
      next(e);
    }
  }

  public async testController(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      return res.send('');
    } catch (e) {
      next(e);
    }
  }

  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      trackRequest(req, 200, req.currentUser, true);
      return res.status(200).json(req.currentUser);
    } catch (e) {
      next(e);
    }
  }
}
