import { Container } from 'typedi';
import { Logger } from '../loaders/logger';
import { AxiosResponse } from 'axios';

export function logResponse(response: AxiosResponse, url: string, error?: any): void {
  const logger: Logger = Container.get('logger');
  if (response.status == 200) {
    logger.info(`URL: ${url}. Response status: ${response.status}. StatusText: ${response.statusText}`);
    const responseBody: string = JSON.stringify(response.data);
    logger.debug(
      `URL: ${url}. Response status: ${response.status}. ResponseShort: ${
        responseBody.length > 150 ? responseBody.substr(0, 150) + '...' : responseBody
      }`
    );
  } else if (error.response) {
    logger.error(`ERROR - URL: ${url}. Response status: ${error.response.status}. Message: ${response.data.Message}`);
  } else {
    logger.error(`ERROR - URL: ${url}. Response status: ${response.status}. Message: ${response.data.Message}`);
  }
}

export function logError(error: any, url: string): void {
  const logger: Logger = Container.get('logger');
  if (error.response && error.response.status == 404) {
    logger.info(`URL: ${url}. Response status: ${error.response.status}. StatusText: ${error.response.statusText}`);
  } else if (error.response && error.response.data) {
    logger.error(`ERROR - URL: ${url}. Error data: ${JSON.stringify(error.response.data)}`);
  } else if (error.response) {
    logger.error(
      `ERROR - URL: ${url} Error: ${error.name}. Message: ${error.message}. Status: ${error.response.status}. StatusText: ${error.response.statusText}`
    );
  } else {
    logger.error(`ERROR - URL: ${url}. Error: ${error.name}. Message: ${error.message}`, error);
  }
}
