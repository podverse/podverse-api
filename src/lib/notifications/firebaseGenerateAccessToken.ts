import { config } from '~/config';
import { JWT } from 'google-auth-library';
const fs = require('fs');

const keyFilePath = config.fcmGoogleApiPathToAuthJson;
const key = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

const client = new JWT(
  key.client_email,
  '',
  key.private_key,
  ['https://www.googleapis.com/auth/firebase.messaging'],
);

export async function generateAccessToken() {
  const token = await client.authorize();
  return token.access_token;
}
