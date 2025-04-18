import './module-alias-config';
require('@dotenvx/dotenvx').config();

import { logger } from 'podverse-helpers';
import { AppDataSourceRead, AppDataSourceReadWrite } from "podverse-orm";
import { startApp } from "./app";

(async () => {
  try {
    logger.info("Connecting to the database");
    await AppDataSourceRead.initialize();
    await AppDataSourceReadWrite.initialize();
    logger.info("Connected to the database");
    
    await startApp();
  } catch (error) {
    logger.error("Error during application startup", error);
    process.exit(1);
  }
})();