import { isValidUUID, AccountSignupMode, ValidationResult, ValidationSummary, validateRequired, validateOptional, validateConditionalOptional } from 'podverse-helpers';
import { loggerService } from '@api/factories/loggerService';

/**
 * Validates critical environment variables and configuration at application startup.
 * This function runs early in the initialization process to catch configuration errors
 * before the application attempts to start serving requests.
 * 
 * @throws Error if any critical validation fails
 */
export const validateStartupRequirements = (): void => {
  loggerService.info('Running startup validation...');

  const summary = validateAllEnvironmentVariables();
  displayValidationResults(summary);
  
  if (summary.requiredMissing > 0) {
    const errorMessage = `FATAL: ${summary.requiredMissing} required environment variable(s) are missing or invalid. Please check the validation output above for details.`;
    loggerService.error(errorMessage);
    // Throw error - stack trace will be suppressed in index.ts for validation errors
    throw new Error(errorMessage);
  }

  loggerService.info('Startup validation completed successfully');
};

/**
 * Validates all environment variables and returns a comprehensive summary
 */
const validateAllEnvironmentVariables = (): ValidationSummary => {
  const results: ValidationResult[] = [];
  
  // Get signup mode early to determine conditional requirements
  const signupMode = (process.env.ACCOUNT_SIGNUP_MODE || 'sign-up') as AccountSignupMode;
  const isSignupModeEnabled = signupMode === 'sign-up';

  // Auth & Security
  results.push(validateJwtSecret());
  results.push(validateUserAgent());

  // Database (from podverse-orm, but validated here)
  results.push(validateRequired('DB_HOST', 'Database'));
  results.push(validateRequired('DB_PORT', 'Database'));
  results.push(validateRequired('DB_READ_USERNAME', 'Database'));
  results.push(validateRequired('DB_READ_PASSWORD', 'Database'));
  results.push(validateRequired('DB_READ_WRITE_USERNAME', 'Database'));
  results.push(validateRequired('DB_READ_WRITE_PASSWORD', 'Database'));
  results.push(validateRequired('DB_DATABASE', 'Database'));
  results.push(validateOptional('DB_SSL_CONNECTION', 'Database', 'Use Default (false)'));

  // API Configuration
  results.push(validateRequired('API_PORT', 'API'));
  results.push(validateRequired('API_PREFIX', 'API'));
  results.push(validateRequired('API_VERSION', 'API'));
  results.push(validateRequired('COOKIE_DOMAIN', 'API'));
  results.push(validateRequired('API_ALLOWED_CORS_ORIGINS', 'API'));

  // Web
  results.push(validateRequired('WEB_PROTOCOL', 'Web'));
  results.push(validateRequired('WEB_DOMAIN', 'Web'));

  // Message Queue
  results.push(validateRequired('MESSAGE_QUEUE_PROTOCOL', 'Message Queue'));
  results.push(validateRequired('MESSAGE_QUEUE_HOST', 'Message Queue'));
  results.push(validateRequired('MESSAGE_QUEUE_USERNAME', 'Message Queue'));
  results.push(validateRequired('MESSAGE_QUEUE_PASSWORD', 'Message Queue'));
  results.push(validateRequired('MESSAGE_QUEUE_PORT', 'Message Queue'));

  // Key-Value DB
  results.push(validateRequired('KEYVALDB_HOST', 'KeyValDB'));
  results.push(validateRequired('KEYVALDB_PORT', 'KeyValDB'));
  results.push(validateRequired('KEYVALDB_PASSWORD', 'KeyValDB'));
  results.push(validateRequired('KEYVALDB_CACHE_TTL_SECONDS', 'KeyValDB'));

  // Podcast Index
  results.push(validateRequired('PODCAST_INDEX_AUTH_KEY', 'Podcast Index'));
  results.push(validateRequired('PODCAST_INDEX_BASE_URL', 'Podcast Index'));
  results.push(validateRequired('PODCAST_INDEX_SECRET_KEY', 'Podcast Index'));

  // Premium/Membership
  results.push(validateSignupMode());
  results.push(validateOptional('PREMIUM_MEMBERSHIP_COST_MONTHLY', 'Premium'));
  results.push(validateOptional('PREMIUM_MEMBERSHIP_COST_ANNUALLY', 'Premium'));
  results.push(validateOptional('FREE_TRIAL_EXPIRATION', 'Premium'));

  // Mailer (conditionally required when signup mode is 'sign-up')
  if (isSignupModeEnabled) {
    results.push(validateRequired('MAILER_HOST', 'Mailer'));
    results.push(validateRequired('MAILER_PORT', 'Mailer'));
    results.push(validateRequired('MAILER_USERNAME', 'Mailer'));
    results.push(validateRequired('MAILER_PASSWORD', 'Mailer'));
    results.push(validateRequired('MAILER_FROM', 'Mailer'));
  } else {
    const mailerHost = validateConditionalOptional('MAILER_HOST', 'Mailer');
    if (mailerHost) results.push(mailerHost);
    const mailerPort = validateConditionalOptional('MAILER_PORT', 'Mailer');
    if (mailerPort) results.push(mailerPort);
    const mailerUsername = validateConditionalOptional('MAILER_USERNAME', 'Mailer');
    if (mailerUsername) results.push(mailerUsername);
    const mailerPassword = validateConditionalOptional('MAILER_PASSWORD', 'Mailer');
    if (mailerPassword) results.push(mailerPassword);
    const mailerFrom = validateConditionalOptional('MAILER_FROM', 'Mailer');
    if (mailerFrom) results.push(mailerFrom);
  }
  results.push(validateOptional('MAILER_DISABLED', 'Mailer', 'Use Default (false)'));

  // Email Configuration (conditionally required when signup mode is 'sign-up')
  if (isSignupModeEnabled) {
    results.push(validateRequired('EMAIL_BRAND_COLOR', 'Email Config'));
    results.push(validateRequired('EMAIL_HEADER_IMAGE_URL', 'Email Config'));
    results.push(validateRequired('LEGAL_NAME', 'Email Config'));
    results.push(validateRequired('LEGAL_ADDRESS', 'Email Config'));
  } else {
    const emailBrandColor = validateConditionalOptional('EMAIL_BRAND_COLOR', 'Email Config');
    if (emailBrandColor) results.push(emailBrandColor);
    const emailHeaderImageUrl = validateConditionalOptional('EMAIL_HEADER_IMAGE_URL', 'Email Config');
    if (emailHeaderImageUrl) results.push(emailHeaderImageUrl);
    const legalName = validateConditionalOptional('LEGAL_NAME', 'Email Config');
    if (legalName) results.push(legalName);
    const legalAddress = validateConditionalOptional('LEGAL_ADDRESS', 'Email Config');
    if (legalAddress) results.push(legalAddress);
  }

  // Social Media (optional - used when signup mode is 'sign-up' but not required)
  results.push(validateOptional('SOCIAL_FACEBOOK_IMAGE_URL', 'Social Media'));
  results.push(validateOptional('SOCIAL_FACEBOOK_PAGE_URL', 'Social Media'));
  results.push(validateOptional('SOCIAL_GITHUB_IMAGE_URL', 'Social Media'));
  results.push(validateOptional('SOCIAL_GITHUB_PAGE_URL', 'Social Media'));
  results.push(validateOptional('SOCIAL_TWITTER_IMAGE_URL', 'Social Media'));
  results.push(validateOptional('SOCIAL_TWITTER_PAGE_URL', 'Social Media'));
  results.push(validateOptional('SOCIAL_REDDIT_IMAGE_URL', 'Social Media'));
  results.push(validateOptional('SOCIAL_REDDIT_PAGE_URL', 'Social Media'));

  // Token Expiration (conditionally required when signup mode is 'sign-up')
  if (isSignupModeEnabled) {
    results.push(validateRequired('VERIFY_EMAIL_TOKEN_EXPIRATION', 'Token Expiration'));
    results.push(validateRequired('EMAIL_CHANGE_VERIFICATION_TOKEN_EXPIRATION', 'Token Expiration'));
    results.push(validateRequired('RESET_PASSWORD_TOKEN_EXPIRATION', 'Token Expiration'));
  } else {
    const verifyEmailTokenExp = validateConditionalOptional('VERIFY_EMAIL_TOKEN_EXPIRATION', 'Token Expiration');
    if (verifyEmailTokenExp) results.push(verifyEmailTokenExp);
    const emailChangeTokenExp = validateConditionalOptional('EMAIL_CHANGE_VERIFICATION_TOKEN_EXPIRATION', 'Token Expiration');
    if (emailChangeTokenExp) results.push(emailChangeTokenExp);
    const resetPasswordTokenExp = validateConditionalOptional('RESET_PASSWORD_TOKEN_EXPIRATION', 'Token Expiration');
    if (resetPasswordTokenExp) results.push(resetPasswordTokenExp);
  }

  // Page Paths (conditionally required when signup mode is 'sign-up')
  if (isSignupModeEnabled) {
    results.push(validateRequired('VERIFY_EMAIL_PAGE_PATH', 'Page Paths'));
    results.push(validateRequired('EMAIL_CHANGE_VERIFICATION_PAGE_PATH', 'Page Paths'));
    results.push(validateRequired('RESET_PASSWORD_PAGE_PATH', 'Page Paths'));
  } else {
    const verifyEmailPagePath = validateConditionalOptional('VERIFY_EMAIL_PAGE_PATH', 'Page Paths');
    if (verifyEmailPagePath) results.push(verifyEmailPagePath);
    const emailChangePagePath = validateConditionalOptional('EMAIL_CHANGE_VERIFICATION_PAGE_PATH', 'Page Paths');
    if (emailChangePagePath) results.push(emailChangePagePath);
    const resetPasswordPagePath = validateConditionalOptional('RESET_PASSWORD_PAGE_PATH', 'Page Paths');
    if (resetPasswordPagePath) results.push(resetPasswordPagePath);
  }

  // PayPal (optional, but validated)
  results.push(validateOptional('PAYPAL_CLIENT_ID', 'PayPal'));
  results.push(validateOptional('PAYPAL_CLIENT_SECRET', 'PayPal'));

  // General
  results.push(validateOptional('NODE_ENV', 'General'));
  results.push(validateOptional('LOG_LEVEL', 'General'));

  // Calculate summary
  const total = results.length;
  const passed = results.filter(r => r.isValid && r.isSet).length;
  const failed = results.filter(r => !r.isValid).length;
  const requiredMissing = results.filter(r => r.isRequired && !r.isValid).length;
  // Count as skipped only if not set and message is "Skipped" (exclude "Use Default" and "Blank")
  const skipped = results.filter(r => !r.isRequired && !r.isSet && r.message === 'Skipped').length;
  // Count defaults used (passed validations with "Use Default" or "Blank" messages)
  const defaultsUsed = results.filter(r => r.isValid && r.isSet && (r.message.includes('Use Default') || r.message === 'Blank')).length;

  return {
    total,
    passed,
    failed,
    requiredMissing,
    skipped,
    defaultsUsed,
    results
  };
};

/**
 * Validates the AUTH_JWT_SECRET environment variable.
 * The JWT secret MUST be a valid UUID to ensure secure token generation.
 */
const validateJwtSecret = (): ValidationResult => {
  const jwtSecret = process.env.AUTH_JWT_SECRET || '';

  if (!jwtSecret) {
    return {
      name: 'AUTH_JWT_SECRET',
      isSet: false,
      isValid: false,
      isRequired: true,
      message: 'Missing - must be a valid UUID',
      category: 'Auth & Security'
    };
  }

  if (!isValidUUID(jwtSecret)) {
    return {
      name: 'AUTH_JWT_SECRET',
      isSet: true,
      isValid: false,
      isRequired: true,
      message: `Invalid UUID format: "${jwtSecret}"`,
      category: 'Auth & Security'
    };
  }

  return {
    name: 'AUTH_JWT_SECRET',
    isSet: true,
    isValid: true,
    isRequired: true,
    message: 'Valid UUID',
    category: 'Auth & Security'
  };
};

/**
 * Validates the USER_AGENT environment variable.
 * The User-Agent MUST follow the format: BrandName Environment/AppName/Version
 * Example: "Podverse Bot Local/API/5"
 */
const validateUserAgent = (): ValidationResult => {
  const userAgent = process.env.USER_AGENT || '';
  const USER_AGENT_PATTERN = /^[^/]+\/[^/]+\/[^/]+$/;

  if (!userAgent) {
    return {
      name: 'USER_AGENT',
      isSet: false,
      isValid: false,
      isRequired: true,
      message: 'Missing - must follow format: BrandName Bot Environment/AppName/Version',
      category: 'Auth & Security'
    };
  }

  const trimmedUserAgent = userAgent.trim();
  
  if (!USER_AGENT_PATTERN.test(trimmedUserAgent)) {
    return {
      name: 'USER_AGENT',
      isSet: true,
      isValid: false,
      isRequired: true,
      message: `Invalid format: "${userAgent}" - must follow format: BrandName Bot Environment/AppName/Version`,
      category: 'Auth & Security'
    };
  }

  // Check that "Bot" is included in the first part (before the first slash)
  const parts = trimmedUserAgent.split('/');
  if (parts.length > 0 && !parts[0].includes('Bot')) {
    return {
      name: 'USER_AGENT',
      isSet: true,
      isValid: false,
      isRequired: true,
      message: `Missing "Bot" in first part: "${userAgent}"`,
      category: 'Auth & Security'
    };
  }

  return {
    name: 'USER_AGENT',
    isSet: true,
    isValid: true,
    isRequired: true,
    message: 'Valid format',
    category: 'Auth & Security'
  };
};

/**
 * Validates ACCOUNT_SIGNUP_MODE
 */
const validateSignupMode = (): ValidationResult => {
  const signupMode = process.env.ACCOUNT_SIGNUP_MODE || '';
  const validModes: AccountSignupMode[] = ['sign-up', 'contact-only'];

  if (!signupMode) {
    return {
      name: 'ACCOUNT_SIGNUP_MODE',
      isSet: false,
      isValid: false,
      isRequired: true,
      message: 'Missing - must be "sign-up" or "contact-only"',
      category: 'Premium/Membership'
    };
  }

  if (!validModes.includes(signupMode as AccountSignupMode)) {
    return {
      name: 'ACCOUNT_SIGNUP_MODE',
      isSet: true,
      isValid: false,
      isRequired: true,
      message: `Invalid value: "${signupMode}" - must be "sign-up" or "contact-only"`,
      category: 'Premium/Membership'
    };
  }

  return {
    name: 'ACCOUNT_SIGNUP_MODE',
    isSet: true,
    isValid: true,
    isRequired: true,
    message: `Set to "${signupMode}"`,
    category: 'Premium/Membership'
  };
};

/**
 * Displays validation results in a formatted table
 */
const displayValidationResults = (summary: ValidationSummary): void => {
  loggerService.info('=== Environment Variable Validation ===');
  
  // Group results by category
  const byCategory = summary.results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, ValidationResult[]>);

  // List of conditionally required variables (required when signup mode is 'sign-up')
  const conditionallyRequiredVars = [
    'MAILER_HOST', 'MAILER_PORT', 'MAILER_USERNAME', 'MAILER_PASSWORD', 'MAILER_FROM',
    'EMAIL_BRAND_COLOR', 'EMAIL_HEADER_IMAGE_URL', 'LEGAL_NAME', 'LEGAL_ADDRESS',
    'VERIFY_EMAIL_TOKEN_EXPIRATION', 'EMAIL_CHANGE_VERIFICATION_TOKEN_EXPIRATION',
    'RESET_PASSWORD_TOKEN_EXPIRATION', 'VERIFY_EMAIL_PAGE_PATH',
    'EMAIL_CHANGE_VERIFICATION_PAGE_PATH', 'RESET_PASSWORD_PAGE_PATH'
  ];

  // Display by category
  const categories = Object.keys(byCategory).sort();
  for (const category of categories) {
    loggerService.info(`[${category}]`);
    for (const result of byCategory[category]) {
      const status = result.isValid ? '✓' : '✗';
      let requiredText = '';
      if (result.isRequired) {
        if (conditionallyRequiredVars.includes(result.name)) {
          requiredText = ' (required when signup mode is \'sign-up\')';
        }
        // No text for always-required vars - lack of parentheses indicates required
      } else {
        requiredText = ' (optional)';
      }
      const logMessage = `  ${status} ${result.name}${requiredText} - ${result.message}`;
      // Log failures as errors, skipped optional vars as warn, passes as info
      if (!result.isValid) {
        loggerService.error(logMessage);
      } else if (!result.isSet && !result.isRequired) {
        loggerService.warn(logMessage);
      } else {
        loggerService.info(logMessage);
      }
    }
  }

  // Display summary
  loggerService.info('=== Validation Summary ===');
  loggerService.info(`Total: ${summary.total}`);
  const passedText = summary.defaultsUsed > 0 
    ? `Passed: ${summary.passed} (${summary.defaultsUsed} using defaults)`
    : `Passed: ${summary.passed}`;
  loggerService.info(passedText);
  if (summary.skipped > 0) {
    loggerService.warn(`Skipped: ${summary.skipped}`);
  }
  loggerService.info(`Failed: ${summary.failed}`);
  loggerService.info(`Required Missing: ${summary.requiredMissing}`);
  
  if (summary.failed > 0) {
    loggerService.error('The following environment variables failed validation:');
    summary.results
      .filter(r => !r.isValid)
      .forEach(r => {
        const requiredText = r.isRequired ? ' (required)' : ' (optional)';
        loggerService.error(`  - ${r.name}${requiredText}: ${r.message}`);
      });
  }
};
