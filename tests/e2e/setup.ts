import { qaResetDatabase, qaSeedDatabase } from './helpers/sql';

beforeAll(async () => {
  // await qaSeedDatabase();
});

afterAll(async () => {
  try {
    // await qaResetDatabase();
  } catch (error) {
    console.error('Error resetting database:', error);
  }
});