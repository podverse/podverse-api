import { config } from '@router-api/config';
import { createLogger, format, transports } from 'winston';
import * as TransportStream from 'winston-transport';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return stack ? `${timestamp} [${level}]: ${message} - ${stack}` : `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: config.logLevel,
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      )
    })
  ]
});

export const addRemoteTransport = (transport: TransportStream) => {
  logger.add(transport);
};

export const logError = (error: Error) => {
  logger.error(error.message, { stack: error.stack });
};

export default logger;