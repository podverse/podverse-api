import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

interface EntityRelationships {
  mediaRef: {
    mustHavePodcast: boolean
    mustHaveUser: boolean
  }
}

export interface IConfig {
  port: number
  debugLogging: boolean
  dbsslconn: boolean
  databaseUrl: string
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
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:mysecretpw@localhost:5432/postgres',
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
