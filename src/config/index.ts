export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
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
  }
};
