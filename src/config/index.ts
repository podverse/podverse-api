import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

interface EntityRelationships {
  mediaRef: {
    mustHavePodcast: boolean
    mustHaveUser: boolean
  }
}

export interface DbConfig {
  type: string
  host: string
  port: number
  username: string
  password: string
  database: string
}

export interface IConfig {
  port: number
  debugLogging: boolean
  dbsslconn: boolean
  dbConfig: DbConfig
  entityRelationships: EntityRelationships
  apiHost: string
  apiPrefix: string
  apiVersion: string
}

const apiHost = process.env.NODE_ENV === 'prod' ? 'https://podverse.fm' : 'http://localhost:3000'

const config: IConfig = {
  port: +process.env.PORT || 3000,
  debugLogging: process.env.NODE_ENV === 'development',
  dbsslconn: process.env.NODE_ENV !== 'development',
  dbConfig: {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  },
  entityRelationships: {
    mediaRef: {
      mustHavePodcast: process.env.MEDIA_REF_HAS_PODCAST === 'true',
      mustHaveUser: process.env.MEDIA_REF_HAS_USER === 'true'
    }
  },
  apiHost,
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || '/v1'
}

export { config }
