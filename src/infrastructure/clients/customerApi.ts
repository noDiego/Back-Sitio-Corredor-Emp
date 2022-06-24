import { Inject, Service } from 'typedi';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { URLS } from '../../constants/urls';
import breakerInstance from '../../utils/circuitBreaker/breakerInstance';
import { CircuitBreaker } from '../../utils/circuitBreaker/circuitBreaker';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { getVSHeaders } from '../../constants/headers';
import { ICustomerAdapter } from '../../domain/interfaces/adapter/ICustomerAdapter';
import { logError, logResponse } from '../../utils/logutils';
import { resolveError } from '../../utils/apiutils';
import { Logger } from '../../loaders/logger';
import { ClientDetailResponse } from './dto/client';
import { IClient } from '../../domain/interfaces/dto/v3/IClient';
import clientDetailConverter from './converters/clientDetailConverter';

@Service('CustomerApi')
export default class CustomerApi implements ICustomerAdapter {
  @Inject('logger') private readonly logger: Logger;

  async getClientDetails(clientRut: number, userSSO: IUserSSO): Promise<IClient> {
    const serviceName = 'ClientDetail';
    const urlApi: string = URLS.customerApi.clientDetail + clientRut;
    const axiosBreaker: CircuitBreaker = breakerInstance(serviceName);

    this.logger.info('Llamando a ClientDetail con rut: ' + clientRut);

    const axiosRequest: AxiosRequestConfig = {
      method: 'get',
      url: urlApi,
      headers: getVSHeaders(userSSO)
    };

    try {
      const response: AxiosResponse<ClientDetailResponse> = await axiosBreaker.exec<ClientDetailResponse>(
        axiosRequest,
        true
      );
      logResponse(response, urlApi, userSSO.transactionID);
      return clientDetailConverter(response.data.client);
    } catch (error) {
      logError(error, urlApi);
      return resolveError(error, serviceName);
    }
  }
}
