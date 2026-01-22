import './module-alias-config';

if (process.env.NODE_ENV !== 'production') {
  require('@dotenvx/dotenvx').config({ path: '.env' });
}

import { AppDataSourceRead, AppDataSourceReadWrite } from "podverse-orm";
import { startApp } from "./app";
import { loggerService } from './factories/loggerService';
import { activeMQArtemisService } from './factories/activeMQArtemisService';
import { validateStartupRequirements } from './lib/startup/validation';
import { testKeyvaldbConnection, keyvaldb } from './lib/keyvaldb/keyvaldb';

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
    try {
      // Check if connection is still open before trying to quit
      if (keyvaldb.status === 'ready' || keyvaldb.status === 'connecting') {
        await keyvaldb.quit();
        loggerService.info('KeyValDB connection closed');
      } else {
        loggerService.info('KeyValDB connection already closed');
      }
    } catch (err) {
      loggerService.error('Error closing KeyValDB connection during shutdown', err as Error);
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
    validateStartupRequirements();

    loggerService.info("Connecting to the database");
    await AppDataSourceRead.initialize();
    await AppDataSourceReadWrite.initialize();
    loggerService.info("Connected to the database");

    // Test KeyValDB connection (non-critical, for caching)
    const keyvaldbConnected = await testKeyvaldbConnection();
    if (keyvaldbConnected) {
      loggerService.info("Connected to KeyValDB");
    } else {
      loggerService.warn("Warning: Unable to connect to KeyValDB, caching will be unavailable");
    }

    const maybeServer = await startApp();
    if (maybeServer) serverInstance = maybeServer;
  } catch (error) {
    // For validation errors, log just the message without stack trace
    if (error instanceof Error && error.message.includes('FATAL:') && error.message.includes('required environment variable')) {
      // Validation error - message already logged in validation.ts, just exit
      process.exit(1);
    } else {
      // Other errors - log with full details
      loggerService.error("Error during application startup", error);
      process.exit(1);
    }
  }
})();