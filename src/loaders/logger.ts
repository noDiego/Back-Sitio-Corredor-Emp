import winston from 'winston';
import config from '../config';
import AppInsights = require('applicationinsights');
import { CorrelationContext } from 'applicationinsights/out/AutoCollection/CorrelationContextManager';
import { ConsoleTransportInstance } from 'winston/lib/winston/transports';

export function getOperationID(): string {
  const context: CorrelationContext = AppInsights.getCorrelationContext();
  return context ? `[${context.operation.id}] ` : '';
}

const transports: ConsoleTransportInstance[] = [];
if (process.env.NODE_ENV !== 'development') {
  transports.push(new winston.transports.Console());
  // transports.push(new winston.transports.File({ filename: 'error-back-corredores.log', level: 'error' }));
  // transports.push(new winston.transports.File({ filename: 'log-back-corredores.log', level: 'info' }));
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.cli(), winston.format.splat())
    })
  );
}

export interface Logger {
  info(message: any, transactionId?: string, ...meta: any[]): void;
  debug(message: any, transactionId?: string, ...meta: any[]): void;
  error(message: any, error?: Error): void;
}

class CustomLogger implements Logger {
  private loggerInstance: winston.Logger = winston.createLogger({
    level: config.logs.level,
    levels: winston.config.npm.levels,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss ZZ'
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.simple()
    ),
    transports
  });

  info(message: any, txId?: string, ...meta: any[]): void {
    this.loggerInstance.info(`${getOperationID()}` + message, meta);
  }

  debug(message: any, transactionId?: string, ...meta: any[]): void {
    this.loggerInstance.debug(`${getOperationID()}` + message, meta);
  }

  error(message: any, error?: Error): void {
    this.loggerInstance.error(`${getOperationID()}${message}${error ? ' - ' + error.stack : ''}`);
  }

  // private logInsight(txId: string, message: any, error?) {
  //   this.insightClient.
  // }
}

const LoggerInstance: Logger = new CustomLogger();

export default LoggerInstance;
