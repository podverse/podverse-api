import { config } from '@api/config';
import { LoggerService } from 'podverse-helpers';

export const loggerService = new LoggerService({
  logDir: config.log.dir,
  logLevel: config.log.level
});
