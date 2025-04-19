import { qaResetDatabase, qaSeedDatabase } from './helpers/sql';

beforeAll(async function () {
  try {
    await qaSeedDatabase();
  } catch (error) {
    console.error('Error seeding database:', error);
  }
});

afterAll(async function () {
  try {
    await qaResetDatabase();
  } catch (error) {
    console.error('Error resetting database:', error);
  }
});