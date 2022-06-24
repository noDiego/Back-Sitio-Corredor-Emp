import rutjs from 'rut.js';
import { Container } from 'typedi';
import { Logger } from 'winston';

export function rutCreate(rut: number, dv: string): string {
  const logger: Logger = Container.get<Logger>('logger');
  if (!rutjs.validate(rut + dv)) {
    logger.info('Invalid rut.');
    return null;
  } else {
    return rutjs.format(rut + dv).replace(/\./g, '');
  }
}

export function dateValidation(dateString: Date): Date {
  const logger: Logger = Container.get<Logger>('logger');
  let date: Date = new Date(dateString);
  if (!(date instanceof Date)) {
    logger.info('Invalid Date. ' + date);
    throw new Error('Invalid Date');
  }
  if (date.getFullYear() < 1900) {
    date = null;
  }
  return date;
}
