import request from 'supertest';
import { config } from '../../src/config';

describe('POST /clip', () => {
  let authToken: string;

  beforeAll(async () => {
    // Perform login to obtain auth token
    const loginData = {
      email: 'trial-valid@example.com', // Replace with a valid test user email
      password: 'Test!1Aa', // Replace with the corresponding password
    };

    const loginResponse = await request(globalThis.__API_SERVER__)
      .post(`${config.api.prefix}${config.api.version}/auth/login`)
      .set('Content-Type', 'application/json') // Explicitly set Content-Type
      .send(loginData)
      .expect(200);

    // Extract the auth token from the response
    authToken = loginResponse.body.token;
  });

  it('should return a successful response and log the entire response body', async () => {
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

    // Log the entire response body
    console.log(JSON.stringify(response.body, null, 2));

    // Ensure the response body contains expected properties
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title', clipData.title);
    expect(response.body).toHaveProperty('description', clipData.description);
    expect(response.body).toHaveProperty('start_time', clipData.start_time);
    expect(response.body).toHaveProperty('end_time', clipData.end_time);
    expect(response.body).toHaveProperty('item_id_text', clipData.item_id_text);
    expect(response.body).toHaveProperty('sharable_status', clipData.sharable_status);
  });
});