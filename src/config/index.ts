import { ConnectionOptions } from 'typeorm'

const env = process.env

export const awsConfig = {
  queueUrls: {
    feedsToParse: env.AWS_QUEUE_FEED_PARSER_URL,
    feedsToParseErrors: env.AWS_QUEUE_FEED_PARSER_ERRORS_URL
  },
  region: env.AWS_REGION
}

export const dbConfig = {
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

export const entityRelationships = {
  mediaRef: {
    mustHavePodcast: env.MEDIA_REF_HAS_PODCAST || false,
    mustHaveUser: env.MEDIA_REF_HAS_USER || false
  }
}
