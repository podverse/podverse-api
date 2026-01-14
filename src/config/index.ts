import { AccountSignupMode } from 'podverse-helpers';

type SocialConfig = {
  pageUrl: string;
  imageUrl: string;
};

type Config = {
  nodeEnv: string;
  userAgent: string;
  log: {
    level: string;
    dir: string;
    timer: boolean;
  };
  auth: {
    jwtSecret: string;
  };
  api: {
    port: string;
    prefix: string;
    version: string;
    cookie: {
      domain: string;
    };
    allowedCORSOrigins: string[];
  };
  email: {
    styles: {
      brandColor: string;
    };
    header: {
      imagueUrl: string;
    };
  };
  emailChangeVerification: {
    pagePath: string;
    tokenExpiration: number;
  },
  legal: {
    name: string;
    address: string;
  },
  mailer: {
    disabled: boolean;
    host: string;
    port: string;
    username: string;
    password: string;
    from: string;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
  };
  podcastIndex: {
    authKey: string;
    baseUrl: string;
    secretKey: string;
  };
  activeMQArtemis: {
    protocol: string;
    host: string;
    username: string;
    password: string;
    port: number;
  };
  keyvaldb: {
    host: string;
    port: number;
    password?: string;
    cacheTTLSeconds: number;
  };
  resetPassword: {
    tokenExpiration: number;
    pagePath: string;
  };
  social: {
    facebook: SocialConfig;
    github: SocialConfig;
    reddit: SocialConfig;
    twitter: SocialConfig;
  };
  verifyEmail: {
    pagePath: string;
    tokenExpiration: number;
  };
  web: {
    protocol: string;
    domain: string;
  };
  premium: {
    costMonthly: number;
    costAnnually: number;
    signupMode: AccountSignupMode;
    freeTrialExpiration: number;
  };
};

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  userAgent: process.env.USER_AGENT || '',
  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
    timer: process.env.LOG_TIMER === 'true',
  },
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET || '',
  },
  api: {
    port: process.env.API_PORT || '1234',
    prefix: process.env.API_PREFIX || '/api',
    version: process.env.API_VERSION || '/v2',
    cookie: {
      domain: process.env.COOKIE_DOMAIN || 'localhost'
    },
    allowedCORSOrigins: (process.env.API_ALLOWED_CORS_ORIGINS || '').split(',').map(origin => origin.trim()),
  },
  email: {
    styles: {
      brandColor: process.env.EMAIL_BRAND_COLOR || '#FF0000',
    },
    header: {
      imagueUrl: process.env.EMAIL_HEADER_IMAGE_URL || '',
    }
  },
  emailChangeVerification: {
    pagePath: process.env.EMAIL_CHANGE_VERIFICATION_PAGE_PATH || '/',
    tokenExpiration: parseInt(process.env.EMAIL_CHANGE_VERIFICATION_TOKEN_EXPIRATION || '31540000', 10),
  },
  legal: {
    name: process.env.LEGAL_NAME || '',
    address: process.env.LEGAL_ADDRESS || '',
  },
  mailer: {
    disabled: process.env.MAILER_DISABLED === 'true',
    host: process.env.MAILER_HOST || '',
    port: process.env.MAILER_PORT || '',
    username: process.env.MAILER_USERNAME || '',
    password: process.env.MAILER_PASSWORD || '',
    from: process.env.MAILER_FROM || '',
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
  },
  podcastIndex: {
    authKey: process.env.PODCAST_INDEX_AUTH_KEY || '',
    baseUrl: process.env.PODCAST_INDEX_BASE_URL || '',
    secretKey: process.env.PODCAST_INDEX_SECRET_KEY || ''
  },
  activeMQArtemis: {
    protocol: process.env.MESSAGE_QUEUE_PROTOCOL || 'amqp',
    host: process.env.MESSAGE_QUEUE_HOST || 'localhost',
    username: process.env.MESSAGE_QUEUE_USERNAME || 'user',
    password: process.env.MESSAGE_QUEUE_PASSWORD || 'mysecretpw',
    port: Number(process.env.MESSAGE_QUEUE_PORT) || 5672
  },
  keyvaldb: {
    host: process.env.KEYVALDB_HOST || '127.0.0.1',
    port: Number(process.env.KEYVALDB_PORT) || 6379,
    password: process.env.KEYVALDB_PASSWORD || undefined,
    cacheTTLSeconds: Number(process.env.KEYVALDB_CACHE_TTL_SECONDS) || 86400,
  },
  resetPassword: {
    tokenExpiration: parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRATION || '86400', 10),
    pagePath: process.env.RESET_PASSWORD_PAGE_PATH || '/',
  },
  social: {
    facebook: {
      pageUrl: process.env.SOCIAL_FACEBOOK_PAGE_URL || '',
      imageUrl: process.env.SOCIAL_FACEBOOK_IMAGE_URL || '',
    },
    github: {
      pageUrl: process.env.SOCIAL_GITHUB_PAGE_URL || '',
      imageUrl: process.env.SOCIAL_GITHUB_IMAGE_URL || '',
    },
    reddit: {
      pageUrl: process.env.SOCIAL_REDDIT_PAGE_URL || '',
      imageUrl: process.env.SOCIAL_REDDIT_IMAGE_URL || '',
    },
    twitter: {
      pageUrl: process.env.SOCIAL_TWITTER_PAGE_URL || '',
      imageUrl: process.env.SOCIAL_TWITTER_IMAGE_URL || '',
    },
  },
  verifyEmail: {
    pagePath: process.env.VERIFY_EMAIL_PAGE_PATH || '/',
    tokenExpiration: parseInt(process.env.VERIFY_EMAIL_TOKEN_EXPIRATION || '31540000', 10),
  },
  web: {
    protocol: process.env.WEB_PROTOCOL || 'http',
    domain: process.env.WEB_DOMAIN || 'localhost',
  },
  premium: {
    costMonthly: Number(process.env.PREMIUM_MEMBERSHIP_COST_MONTHLY) || 5,
    costAnnually: Number(process.env.PREMIUM_MEMBERSHIP_COST_ANNUALLY) || 50,
    signupMode: (process.env.ACCOUNT_SIGNUP_MODE || 'sign-up') as AccountSignupMode,
    freeTrialExpiration: parseInt(process.env.FREE_TRIAL_EXPIRATION || '2592000', 10),
  }
};
