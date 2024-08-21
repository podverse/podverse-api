export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
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
