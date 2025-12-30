import './module-alias-config';

if (process.env.NODE_ENV !== 'production') {
  require('@dotenvx/dotenvx').config({ path: '.env' });
}

import { AppDataSourceRead, AppDataSourceReadWrite } from "podverse-orm";
import { startApp } from "./app";
import { loggerService } from './factories/loggerService';
import { activeMQArtemisService } from './factories/activeMQArtemisService';

let serverInstance: import('http').Server | null = null;

const shutdown = async (signal?: string) => {
  try {
    loggerService.info(`Shutdown initiated${signal ? ` due to ${signal}` : ''}`);
    if (serverInstance) {
      await new Promise<void>((resolve, reject) => {
        serverInstance!.close((err) => (err ? reject(err) : resolve()));
      });
      loggerService.info('HTTP server closed');
    }
    try {
      await activeMQArtemisService.close();
    } catch (err) {
      loggerService.error('Error closing Artemis during shutdown', err as Error);
    }
    try {
      await AppDataSourceRead.destroy();
      await AppDataSourceReadWrite.destroy();
      loggerService.info('Database connections closed');
    } catch (err) {
      loggerService.error('Error closing DB connections during shutdown', err as Error);
    }
  } catch (err) {
    loggerService.error('Error during shutdown', err as Error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

(async () => {
  try {
    loggerService.info("Connecting to the database");
    await AppDataSourceRead.initialize();
    await AppDataSourceReadWrite.initialize();
    loggerService.info("Connected to the database");

    const maybeServer = await startApp();
    if (maybeServer) serverInstance = maybeServer;
  } catch (error) {
    loggerService.error("Error during application startup", error);
    process.exit(1);
  }
})();