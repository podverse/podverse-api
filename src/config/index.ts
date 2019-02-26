import awsConfig from '~/config/aws'

export interface DbConfig {
  type: string
  host: string
  port: number
  username: string
  password: string
  database: string
  sslConnection: boolean
}

export interface IConfig {
  port: number
  debugLogging: boolean
  dbConfig: DbConfig
  apiPrefix: string
  apiVersion: string
  cookieDomain: string
  cookieIsSecure: boolean
  queryEpisodesLimit: number
  queryMediaRefsLimit: number
  queryPlaylistsLimit: number
  queryPodcastsLimit: number
  queryUsersLimit: number
  jwtSecret: string
  resetPasswordTokenExpiration: number
  emailVerificationTokenExpiration: number
  freeTrialExpiration: number
  membershipExpiration: number
  mailerService: string
  mailerHost: string
  mailerPort: number
  mailerUsername: string
  mailerPassword: string
  awsConfig: any
  bitpayConfig: any
  paypalConfig: any
  websiteDomain: string
  websiteProtocol: string
  websiteResetPasswordPagePath: string
  websiteVerifyEmailPagePath: string
}

let port = process.env.PORT || '1234'
let dbPort = process.env.DB_PORT || '5432'
let resetPasswordTokenExpiration = process.env.RESET_PASSWORD_TOKEN_EXPIRATION || '86400'
let emailVerificationTokenExpiration = process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION || '31540000'
let freeTrialExpiration = process.env.FREE_TRIAL_EXPIRATION || '2592000'
let membershipExpiration = process.env.PREMIUM_MEMBERSHIP_EXPIRATION || '31540000'
let mailerPort = process.env.MAILER_PORT || '587'
let cookieDomain = process.env.COOKIE_DOMAIN || 'localhost'
let cookieIsSecure = process.env.COOKIE_IS_SECURE === 'true'
let queryEpisodesLimit = process.env.QUERY_EPISODES_LIMIT || '20'
let queryMediaRefsLimit = process.env.QUERY_MEDIA_REFS_LIMIT || '20'
let queryPlaylistsLimit = process.env.QUERY_PLAYLISTS_LIMIT || '20'
let queryPodcastsLimit = process.env.QUERY_PODCASTS_LIMIT || '20'
let queryUsersLimit = process.env.QUERY_USERS_LIMIT || '20'

const bitpayConfig = {
  apiKeyPath: process.env.BITPAY_API_KEY_PATH || '/',
  apiKeyPassword: process.env.BITPAY_API_KEY_PASSWORD || '',
  currency: process.env.BITPAY_CURRENCY || 'USD',
  notificationURL: process.env.BITPAY_NOTIFICATION_URL,
  price: process.env.PREMIUM_MEMBERSHIP_COST,
  redirectURL: process.env.BITPAY_REDIRECT_URL
}

const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  mode: process.env.PAYPAL_MODE,
  webhookIdPaymentSaleCompleted: process.env.PAYPAL_WEBHOOK_ID_PAYMENT_SALE_COMPLETED
}

const websiteDomain = process.env.WEBSITE_DOMAIN || ''

const config: IConfig = {
  port: parseInt(port, 10),
  debugLogging: process.env.NODE_ENV === 'development',
  dbConfig: {
    type: process.env.DB_TYPE || '',
    host: process.env.DB_HOST || '',
    port: parseInt(dbPort, 10),
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    sslConnection: process.env.DB_SSL_CONNECTION === 'true'
  },
  apiPrefix: process.env.API_PREFIX || '',
  apiVersion: process.env.API_VERSION || '',
  cookieDomain,
  cookieIsSecure,
  queryEpisodesLimit: parseInt(queryEpisodesLimit, 10),
  queryMediaRefsLimit: parseInt(queryMediaRefsLimit, 10),
  queryPlaylistsLimit: parseInt(queryPlaylistsLimit, 10),
  queryPodcastsLimit: parseInt(queryPodcastsLimit, 10),
  queryUsersLimit: parseInt(queryUsersLimit, 10),
  jwtSecret: process.env.JWT_SECRET || '',
  resetPasswordTokenExpiration: parseInt(resetPasswordTokenExpiration, 10),
  emailVerificationTokenExpiration: parseInt(emailVerificationTokenExpiration, 10),
  freeTrialExpiration: parseInt(freeTrialExpiration, 10),
  membershipExpiration: parseInt(membershipExpiration, 10),
  mailerService: process.env.mailerService || '',
  mailerHost: process.env.mailerHost || '',
  mailerPort: parseInt(mailerPort, 10),
  mailerUsername: process.env.MAILER_USERNAME || '',
  mailerPassword: process.env.MAILER_PASSWORD || '',
  awsConfig,
  bitpayConfig,
  paypalConfig,
  websiteDomain,
  websiteProtocol: process.env.WEBSITE_PROTOCOL || '',
  websiteResetPasswordPagePath: process.env.WEBSITE_RESET_PASSWORD_PAGE_PATH || '',
  websiteVerifyEmailPagePath: process.env.WEBSITE_VERIFY_EMAIL_PAGE_PATH || ''
}

export { config }
