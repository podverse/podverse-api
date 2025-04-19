import * as fs from 'fs';
import * as path from 'path';

export const qaRunsRawSQL = async (relativeFilePath: string): Promise<void> => {
  const sqlFilePath = path.resolve(__dirname, relativeFilePath);
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

  const queryRunner = globalThis.__APP_DATA_SOURCE__.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query(sqlContent);
  } catch (error) {
    console.error('Error executing SQL file:', error);
  } finally {
    await queryRunner.release();
  }
};

export const qaResetDatabase = async (): Promise<void> => {
  await qaRunsRawSQL('../sql/reset.sql');
};

export const qaSeedDatabase = async (): Promise<void> => {
  await qaRunsRawSQL('../sql/feed-channel-item-live-item.sql');
  await qaRunsRawSQL('../sql/account.sql');
}
