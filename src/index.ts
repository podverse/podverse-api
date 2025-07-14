import './module-alias-config';

if (process.env.NODE_ENV !== 'production') {
  require('@dotenvx/dotenvx').config({ path: '.env' });
}

import { AppDataSourceRead, AppDataSourceReadWrite } from "podverse-orm";
import { startApp } from "./app";
import { loggerService } from './factories/loggerService';

(async () => {
  try {
    loggerService.info("Connecting to the database");
    await AppDataSourceRead.initialize();
    await AppDataSourceReadWrite.initialize();
    loggerService.info("Connected to the database");

    await startApp();
  } catch (error) {
    loggerService.error("Error during application startup", error);
    process.exit(1);
  }
})();