export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET || '',
  },
  api: {
    port: process.env.API_PORT || '1234',
    prefix: process.env.API_PREFIX || '/api',
    version: process.env.API_VERSION || '/v2',
    userAgent: process.env.USER_AGENT || '',
    cookie: {
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      secure: process.env.COOKIE_SECURE === 'true',
    },
  },
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'db',
    ssl_connection: process.env.DB_SSL_CONNECTION === 'true',
  }
};
