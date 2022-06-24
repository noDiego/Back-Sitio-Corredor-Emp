import { Request, Response } from 'express';
import { Container } from 'typedi';
import { getConnectionManager } from 'typeorm';
import { IRedisClient } from '../../../loaders/redis';
import config from '../../../config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import AzureStorageRepository from '../../repositories/azureStorageRepository';

export async function healthCheck(req: Request, res: Response): Promise<void> {
  const resp: string[] = [];

  const request: AxiosRequestConfig = {
    method: 'get',
    url: config.azureServiceBusURL
  };

  try {
    const resultBusClient: AxiosResponse = await axios(request);
    if (resultBusClient.status == 200) {
      resp.push('Conexion Bus Client OK');
    } else {
      resp.push('Conexion Bus Client NOTOK');
    }
  } catch (e) {
    resp.push('Error al intentar conectar al Bus Client: ' + e.message);
  }

  const redis: IRedisClient = Container.get('RedisClient');
  const resultRedis: boolean = redis.isConnected();
  if (resultRedis) {
    resp.push('Conexion Redis OK');
  } else {
    resp.push('Conexion Redis NOTOK');
  }

  try {
    const resultBD: boolean = getConnectionManager().connections[0].isConnected;
    if (resultBD) {
      resp.push('Conexion BD OK');
    } else {
      resp.push('Conexion BD NOTOK');
    }
  } catch (e) {
    resp.push('Error al intentar conectar a BD: ' + e.message);
  }

  const azureStorage: AzureStorageRepository = Container.get('AzureStorageRepository');
  try {
    const resultStoragePayroll: boolean = await azureStorage.validateContainer(config.payrollContainer);
    if (resultStoragePayroll) {
      resp.push('Conexion Azure Storage payroll OK');
    } else {
      resp.push('Conexion Azure Storage payroll NOTOK');
    }
  } catch (e) {
    resp.push('Error al intentar conectar a Azure Storage payroll: ' + e.message);
  }

  try {
    const resultStorageDenounce: boolean = await azureStorage.validateContainer(config.denounceAppContainer);
    if (resultStorageDenounce) {
      resp.push('Conexion Azure Storage denounce OK');
    } else {
      resp.push('Conexion Azure Storage denounce NOTOK');
    }
  } catch (e) {
    resp.push('Error al intentar conectar a Azure Storage denounce: ' + e.message);
  }

  res.send(resp.join('\n'));
}
