import '../../src/module-alias-config';
require('@dotenvx/dotenvx').config();

import { startApp } from "../../src/app";
import { AppDataSourceRead, AppDataSourceReadWrite } from 'podverse-orm';
import { qaResetDatabase, qaSeedDatabase } from './helpers/sql';

let server: any;

beforeAll(async () => {
  await AppDataSourceRead.initialize();
  await AppDataSourceReadWrite.initialize();

  await qaSeedDatabase();

  server = await startApp();
});

afterAll(async () => {
  if (server) {
    await server.close();
  }
  
  try {
    await qaResetDatabase();
  } catch (error) {
    console.error('Error resetting database:', error);
  }

  const pools = [AppDataSourceRead, AppDataSourceReadWrite];
  for (const pool of pools) {
    
    if (pool.isInitialized) {
      const queryRunner = pool.createQueryRunner();

      try {
        await queryRunner.release();
      } catch (error) {
        console.error('Error releasing query runner:', error);
      }
      try {
        await pool.destroy();
      } catch (error) {
        console.error('Error destroying data source:', error);
      }
    }
  }
});