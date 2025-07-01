import request from 'supertest';
import { config } from '../../src/config';

describe('POST /clip', () => {
  let authToken: string;

  beforeAll(async () => {
    // Perform login to obtain auth token
    const loginData = {
      email: 'trial-valid@example.com', // Replace with a valid test user email
      password: 'Test1!Aa', // Replace with the corresponding password
      includeTokenInResponseBody: true, // Ensure the token is included in the response body
    };

    const loginResponse = await request(globalThis.__API_SERVER__)
      .post(`${config.api.prefix}${config.api.version}/auth/login`)
      .set('Content-Type', 'application/json') // Explicitly set Content-Type
      .send(loginData)
      .expect(200);
    // Extract the auth token from the response
    authToken = loginResponse.body.token;
  });

  it('should return a successful response and validate the exact values of the response body', async () => {
    const clipData = {
      start_time: 0,
      end_time: 60,
      title: 'Sample Clip',
      description: 'This is a sample clip description.',
      item_id_text: 'item123',
      sharable_status: 1, // Example sharable status
    };

    const response = await request(globalThis.__API_SERVER__)
      .post(`${config.api.prefix}${config.api.version}/clip`)
      .set('Authorization', `Bearer ${authToken}`) // Pass the auth token with the request
      .set('Content-Type', 'application/json') // Explicitly set Content-Type
      .send(clipData)
      .expect(201);

    const clip = response.body;

    // Validate top-level properties
    expect(clip).toHaveProperty('id', 1);
    expect(clip).toHaveProperty('id_text');
    expect(clip).toHaveProperty('title', 'Sample Clip');
    expect(clip).toHaveProperty('description', 'This is a sample clip description.');
    expect(clip).toHaveProperty('start_time', 0);
    expect(clip).toHaveProperty('end_time', 60);
    expect(clip).toHaveProperty('sharable_status', 1);

    // Validate `account` object
    expect(clip).toHaveProperty('account');
    expect(clip.account).toHaveProperty('id', 2);
    expect(clip.account).toHaveProperty('id_text', 'trial-valid');
    expect(clip.account).toHaveProperty('verified', true);

    // Validate `item` object
    expect(clip).toHaveProperty('item');
    expect(clip.item).toHaveProperty('id', 1);
    expect(clip.item).toHaveProperty('id_text', 'item123');
    expect(clip.item).toHaveProperty('slug', 'sample-item');
    expect(clip.item).toHaveProperty('guid', 'item-guid-123');
    expect(clip.item).toHaveProperty('guid_enclosure_url', 'https://samplechannel.com/item.mp3');
    expect(clip.item).toHaveProperty('pub_date', '2025-01-01T13:00:00.000Z');
    expect(clip.item).toHaveProperty('title', 'Sample Item');
  });
});