import { Container } from 'typedi';
import { CircuitBreaker } from './circuitBreaker';
import { BreakerOptions } from './breakerOptions';
import logger from '../../loaders/logger';
import config from '../../config';

const optionsBreaker: BreakerOptions = new BreakerOptions(
  config.circuitBreaker.cbFailureThreshold,
  config.circuitBreaker.cbSuccessThreshold,
  config.circuitBreaker.cbTimeout
);

export default (serviceName: string): CircuitBreaker => {
  const instanceName: string = serviceName + '-BreakerInstance';
  const hasInstance: boolean = Container.has<CircuitBreaker>(instanceName);

  if (!hasInstance) {
    logger.info(`Iniciando CircuitBreaker para servicio: ${serviceName}. ID: ${instanceName}`);
    Container.set(instanceName, new CircuitBreaker(optionsBreaker));
  }
  return Container.get<CircuitBreaker>(instanceName);
};
