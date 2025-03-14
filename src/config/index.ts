type SocialConfig = {
  pageUrl: string;
  imageUrl: string;
};

type Config = {
  nodeEnv: string;
  logLevel: string;
  userAgent: string;
  auth: {
    jwtSecret: string;
  };
  api: {
    port: string;
    prefix: string;
    version: string;
    cookie: {
      domain: string;
      secure: boolean;
    };
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
};

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  userAgent: process.env.USER_AGENT || '',
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET || '',
  },
  api: {
    port: process.env.API_PORT || '1234',
    prefix: process.env.API_PREFIX || '/api',
    version: process.env.API_VERSION || '/v2',
    cookie: {
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      secure: process.env.COOKIE_SECURE === 'true',
    },
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
  }
};
