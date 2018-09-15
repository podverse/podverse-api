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
  jwtSecret: string
  databaseUrl: string
  entityRelationships: EntityRelationships
}

const config: IConfig = {
  port: +process.env.PORT || 3000,
  debugLogging: process.env.NODE_ENV === 'development',
  dbsslconn: process.env.NODE_ENV !== 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-whatever',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:mysecretpw@localhost:5432/postgres',
  entityRelationships: {
    mediaRef: {
      mustHavePodcast: process.env.MEDIA_REF_HAS_PODCAST === 'true',
      mustHaveUser: process.env.MEDIA_REF_HAS_USER === 'true'
    }
  }
}

export { config }
