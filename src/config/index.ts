import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

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
  apiHost: string
  apiPrefix: string
  apiVersion: string
  jwtSecret: string
  resetPasswordTokenExpiration: number
  emailVerificationTokenExpiration: number
  mailerService: string
  mailerHost: string
  mailerPort: number
  mailerUsername: string
  mailerPassword: string
}

const apiHost = process.env.NODE_ENV === 'prod' ? 'https://podverse.fm' : 'http://localhost:3000'

let port = process.env.PORT || '3000'
let dbPort = process.env.DB_PORT || '5432'
let resetPasswordTokenExpiration = process.env.RESET_PASSWORD_TOKEN_EXPIRATION || '86400'
let emailVerificationTokenExpiration = process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION || '31540000'
let mailerPort = process.env.MAILER_PORT || '587'

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
  apiHost,
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || '/v1',
  jwtSecret: process.env.JWT_SECRET || 'mysecretjwt',
  resetPasswordTokenExpiration: parseInt(resetPasswordTokenExpiration, 10),
  emailVerificationTokenExpiration: parseInt(emailVerificationTokenExpiration, 10),
  mailerService: process.env.mailerService || '',
  mailerHost: process.env.mailerHost || '',
  mailerPort: parseInt(mailerPort, 10),
  mailerUsername: process.env.MAILER_USERNAME || '',
  mailerPassword: process.env.MAILER_PASSWORD || ''
}

export { config }
