import { config } from '@api/config';
import { LoggerService } from 'podverse-helpers/dist/lib/backend/logger';

export const loggerService = new LoggerService({
  logDir: config.log.dir,
  logLevel: config.log.level
});
