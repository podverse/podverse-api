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
  apiPrefix: string
  apiVersion: string
}

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
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || '/v1'
}

export { config }
