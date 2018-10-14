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

let port = process.env.PORT || '3000'
let dbPort = process.env.DB_PORT || '5432'

const config: IConfig = {
  port: parseInt(port, 10),
  debugLogging: process.env.NODE_ENV === 'development',
  dbsslconn: process.env.NODE_ENV !== 'development',
  dbConfig: {
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(dbPort, 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'mysecretpw',
    database: process.env.DB_DATABASE || 'postgres'
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
