import '../../src/module-alias-config';
require('@dotenvx/dotenvx').config({ path: '.env-local-test' });

import { AppDataSourceRead, AppDataSourceReadWrite } from 'podverse-orm';
import { startApp } from '../../src/app';

export default async function globalSetup(): Promise<void> {
  try {
    await AppDataSourceRead.initialize();
    await AppDataSourceReadWrite.initialize();

    const apiServer = await startApp();
    globalThis.__API_SERVER__ = apiServer;
    globalThis.__APP_DATA_SOURCE__ = AppDataSourceReadWrite;
  } catch (error) {
    console.error('Error during global setup:', error);
    throw error;
  }
}