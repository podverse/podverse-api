import awsConfig from '~/config/aws'

export interface DbConfig {
  type: string
  host: string
  port: number
  username: string
  password: string
  database: string
  sslConnection: boolean
  shouldSync: boolean
}

export interface Config {
  port: number
  debugLogging: boolean
  dbConfig: DbConfig
  apiPrefix: string
  apiVersion: string
  userAgent: string
  cookieDomain: string
  cookieIsSecure: boolean
  superUserId: string
  shrunkImageSize: number
  emailBrandColor: string
  emailHeaderImageUrl: string
  emailUnsubscribeUrl: string
  queryAuthorsLimit: number
  queryCategoriesLimit: number
  queryEpisodesLimit: number
  queryMediaRefsLimit: number
  queryPlaylistsLimit: number
  queryPodcastsLimit: number
  queryUsersLimit: number
  queryUserHistoryItemsLimit: number
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
  mailerFrom: string
  appStoreConfig: any
  awsConfig: any
  bitpayConfig: any
  paypalConfig: any
  socialFacebookImageUrl: string
  socialFacebookPageUrl: string
  socialGithubImageUrl: string
  socialGithubPageUrl: string
  socialRedditImageUrl: string
  socialRedditPageUrl: string
  socialTwitterImageUrl: string
  socialTwitterPageUrl: string
  parserSupportedLanguages: any[]
  podcastIndexConfig: any
  legalName: string
  legalAddress: string
  websiteDomain: string
  websiteProtocol: string
  websiteResetPasswordPagePath: string
  websiteVerifyEmailPagePath: string
  rateLimiterMaxOverride: any
  manticore: any
  minimumMobileVersion: string
  maintenanceMode: {
    isEnabled: boolean
    durationExpected: number
  }
}

const port = process.env.PORT || '1234'
const dbPort = process.env.DB_PORT || '5432'
const resetPasswordTokenExpiration = process.env.RESET_PASSWORD_TOKEN_EXPIRATION || '86400'
const emailVerificationTokenExpiration = process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION || '31540000'
const freeTrialExpiration = process.env.FREE_TRIAL_EXPIRATION || '2592000'
const membershipExpiration = process.env.PREMIUM_MEMBERSHIP_EXPIRATION || '31540000'
const mailerPort = process.env.MAILER_PORT || '587'
const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost'
const cookieIsSecure = process.env.COOKIE_IS_SECURE === 'true'
const superUserId = process.env.SUPER_USER_ID || ''
const emailBrandColor = process.env.EMAIL_BRAND_COLOR || '#000'
const emailHeaderImageUrl = process.env.EMAIL_HEADER_IMAGE_URL || ''
const emailUnsubscribeUrl = process.env.EMAIL_UNSUBSCRIBE_URL || ''
const shrunkImageSize = process.env.SHRUNK_IMAGE_SIZE || '400'
const queryAuthorsLimit = process.env.QUERY_AUTHORS_LIMIT || '20'
const queryCategoriesLimit = process.env.QUERY_CATEGORIES_LIMIT || '20'
const queryEpisodesLimit = process.env.QUERY_EPISODES_LIMIT || '20'
const queryMediaRefsLimit = process.env.QUERY_MEDIA_REFS_LIMIT || '20'
const queryPlaylistsLimit = process.env.QUERY_PLAYLISTS_LIMIT || '20'
const queryPodcastsLimit = process.env.QUERY_PODCASTS_LIMIT || '20'
const queryUsersLimit = process.env.QUERY_USERS_LIMIT || '20'
const queryUserHistoryItemsLimit = process.env.QUERY_USER_HISTORY_ITEMS_LIMIT || '20'
const rateLimiterMaxOverride = process.env.RATE_LIMITER_MAX_OVERRIDE || false
const socialFacebookImageUrl = process.env.SOCIAL_FACEBOOK_IMAGE_URL || ''
const socialFacebookPageUrl = process.env.SOCIAL_FACEBOOK_PAGE_URL || ''
const socialGithubImageUrl = process.env.SOCIAL_GITHUB_IMAGE_URL || ''
const socialGithubPageUrl = process.env.SOCIAL_GITHUB_PAGE_URL || ''
const socialRedditImageUrl = process.env.SOCIAL_REDDIT_IMAGE_URL || ''
const socialRedditPageUrl = process.env.SOCIAL_REDDIT_PAGE_URL || ''
const socialTwitterImageUrl = process.env.SOCIAL_TWITTER_IMAGE_URL || ''
const socialTwitterPageUrl = process.env.SOCIAL_TWITTER_PAGE_URL || ''
const legalName = process.env.LEGAL_NAME || ''
const legalAddress = process.env.LEGAL_ADDRESS || ''
const podcastIndexAuthKey = process.env.PODCAST_INDEX_AUTH_KEY || ''
const podcastIndexSecretKey = process.env.PODCAST_INDEX_SECRET_KEY || ''
const podcastIndexBaseUrl = process.env.PODCAST_INDEX_BASE_URL || ''
// default 1 hour (3600000 milliseconds)
const podcastIndexRecentlyUpdatedSinceTime =
  process.env.PODCAST_INDEX_RECENTLY_UPDATED_SINCE_TIME || '3600000'
const podcastIndexNewFeedsSinceTime =
  process.env.PODCAST_INDEX_NEW_FEEDS_SINCE_TIME || '3600000'

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
  mode: process.env.PAYPAL_MODE
}

const appStoreConfig = {
  apiUrlProd: process.env.APP_STORE_API_URL_PROD,
  apiUrlSandbox: process.env.APP_STORE_API_URL_SANDBOX,
  sharedSecret: process.env.APP_STORE_API_SHARED_SECRET
}

let parserSupportedLanguages = process.env.PARSER_SUPPORTED_LANGUAGES || 'en' as any
parserSupportedLanguages = parserSupportedLanguages.split(',')

const podcastIndexConfig = {
  authKey: podcastIndexAuthKey,
  secretKey: podcastIndexSecretKey,
  baseUrl: podcastIndexBaseUrl,
  getRecentlyUpdatedSinceTime: parseInt(podcastIndexRecentlyUpdatedSinceTime, 10),
  podcastIndexNewFeedsSinceTime: parseInt(podcastIndexNewFeedsSinceTime, 10)
}

const websiteDomain = process.env.WEBSITE_DOMAIN || ''

const minimumMobileVersion = process.env.MINIMUM_MOBILE_VERSION || ''

const config: Config = {
  port: parseInt(port, 10),
  debugLogging: process.env.NODE_ENV === 'development',
  dbConfig: {
    type: process.env.DB_TYPE || '',
    host: process.env.DB_HOST || '',
    port: parseInt(dbPort, 10),
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    sslConnection: process.env.DB_SSL_CONNECTION === 'true',
    shouldSync: process.env.DB_SHOULD_SYNC === 'true'
  },
  apiPrefix: process.env.API_PREFIX || '',
  apiVersion: process.env.API_VERSION || '',
  userAgent: process.env.USER_AGENT || 'Unidentified podcast API',
  cookieDomain,
  cookieIsSecure,
  superUserId,
  shrunkImageSize: parseInt(shrunkImageSize, 10),
  emailBrandColor,
  emailHeaderImageUrl,
  emailUnsubscribeUrl,
  queryAuthorsLimit: parseInt(queryAuthorsLimit, 10),
  queryCategoriesLimit: parseInt(queryCategoriesLimit, 10),
  queryEpisodesLimit: parseInt(queryEpisodesLimit, 10),
  queryMediaRefsLimit: parseInt(queryMediaRefsLimit, 10),
  queryPlaylistsLimit: parseInt(queryPlaylistsLimit, 10),
  queryPodcastsLimit: parseInt(queryPodcastsLimit, 10),
  queryUsersLimit: parseInt(queryUsersLimit, 10),
  queryUserHistoryItemsLimit: parseInt(queryUserHistoryItemsLimit, 10),
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
  mailerFrom: process.env.MAILER_FROM || '',
  appStoreConfig,
  awsConfig,
  bitpayConfig,
  paypalConfig,
  socialFacebookImageUrl,
  socialFacebookPageUrl,
  socialGithubImageUrl,
  socialGithubPageUrl,
  socialRedditImageUrl,
  socialRedditPageUrl,
  socialTwitterImageUrl,
  socialTwitterPageUrl,
  parserSupportedLanguages,
  podcastIndexConfig,
  legalName,
  legalAddress,
  websiteDomain,
  websiteProtocol: process.env.WEBSITE_PROTOCOL || '',
  websiteResetPasswordPagePath: process.env.WEBSITE_RESET_PASSWORD_PAGE_PATH || '',
  websiteVerifyEmailPagePath: process.env.WEBSITE_VERIFY_EMAIL_PAGE_PATH || '',
  rateLimiterMaxOverride,
  manticore: {
    domain: process.env.MANTICORE_DOMAIN || 'localhost',
    port: process.env.MANTICORE_PORT ? parseInt(process.env.MANTICORE_PORT, 10) : 9308,
    protocol: process.env.MANTICORE_PROTOCOL || 'http'
  },
  minimumMobileVersion,
  maintenanceMode: {
    isEnabled: process.env.MAINTENANCE_MODE_ENABLED === 'true' || false,
    durationExpected: process.env.MAINTENANCE_MODE_DURATION_EXPECTED ? 
      parseInt(process.env.MAINTENANCE_MODE_DURATION_EXPECTED) : 0
  }
}

export { config }
