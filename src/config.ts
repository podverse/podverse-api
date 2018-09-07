import { ConnectionOptions } from 'typeorm';

const env = process.env
const mustHavePodcast = env.MEDIA_REF_HAS_PODCAST || false
const mustHaveUser = env.MEDIA_REF_HAS_USER || false

const envDbConfig = {
  database: 'postgres',
  host: env.DB_HOST || '0.0.0.0',
  log: {
    query: env.DB_LOG_QUERIES || true
  },
  password: env.DB_PASSWORD || 'mysecretpw',
  port: env.DB_PORT || 5432,
  synchronize: env.DB_SYNCHRONIZE || true,
  type: 'postgres',
  username: env.DB_USERNAME || 'postgres'
} as ConnectionOptions

export const dbConfig = envDbConfig

const entityRelationships = {
  mediaRef: {
    mustHavePodcast,
    mustHaveUser
  }
}

export default {
  entityRelationships
}
