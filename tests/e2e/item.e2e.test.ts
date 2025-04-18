import request from 'supertest';
import { config } from '../../src/config';

describe('Item Endpoints', () => {
  describe('GET /item', () => {
    it('should return a list of items', async () => {
      const response = await request(globalThis.__API_SERVER__)
        .get(`${config.api.prefix}${config.api.version}/item`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('page');
    });
  });
});
