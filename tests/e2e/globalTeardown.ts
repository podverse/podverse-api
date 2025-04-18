import { AppDataSourceRead, AppDataSourceReadWrite } from 'podverse-orm';

export default async function globalTeardown(): Promise<void> {
  const apiServer = globalThis.__API_SERVER__;

  if (apiServer) {
    await apiServer.close();
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
}