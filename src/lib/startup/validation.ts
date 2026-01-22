import { isValidUUID } from 'podverse-helpers';
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

  try {
    validateJwtSecret();
    validateUserAgent();
    // Add additional startup validations here as needed
    // Example: validateDatabaseConfig(), validateSMTPConfig(), etc.

    loggerService.info('Startup validation completed successfully');
  } catch (error) {
    loggerService.error('Startup validation failed', error as Error);
    throw error; // Re-throw to prevent application startup
  }
};

/**
 * Validates the AUTH_JWT_SECRET environment variable.
 * The JWT secret MUST be a valid UUID to ensure secure token generation.
 * 
 * @throws Error if AUTH_JWT_SECRET is missing or not a valid UUID
 */
const validateJwtSecret = (): void => {
  const jwtSecret = process.env.AUTH_JWT_SECRET || '';

  if (!jwtSecret) {
    throw new Error(
      'FATAL: AUTH_JWT_SECRET environment variable is required but not set.\n' +
      'Please set AUTH_JWT_SECRET to a valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000).'
    );
  }

  if (!isValidUUID(jwtSecret)) {
    throw new Error(
      `FATAL: AUTH_JWT_SECRET must be a valid UUID.\n` +
      `Current value "${jwtSecret}" is not a valid UUID.\n` +
      `Please generate a valid UUID (e.g., using 'uuidgen' command or https://www.uuidgenerator.net/).\n` +
      `Example format: 123e4567-e89b-12d3-a456-426614174000`
    );
  }
};

/**
 * Validates the USER_AGENT environment variable.
 * The User-Agent MUST follow the format: BrandName Environment/AppName/Version
 * Example: "Podverse Bot Local/API/5"
 * 
 * @throws Error if USER_AGENT is missing or not in the correct format
 */
const validateUserAgent = (): void => {
  const userAgent = process.env.USER_AGENT || '';
  const USER_AGENT_PATTERN = /^[^/]+\/[^/]+\/[^/]+$/;

  if (!userAgent) {
    throw new Error(
      'FATAL: USER_AGENT environment variable is required but not set.\n' +
      'Please set USER_AGENT to a valid format (e.g., Podverse Bot Local/API/5).'
    );
  }

  const trimmedUserAgent = userAgent.trim();
  
  if (!USER_AGENT_PATTERN.test(trimmedUserAgent)) {
    throw new Error(
      `FATAL: USER_AGENT must follow the format: BrandName Bot Environment/AppName/Version\n` +
      `Current value "${userAgent}" is not in the correct format.\n` +
      `Example format: Podverse Bot Local/API/5`
    );
  }

  // Check that "Bot" is included in the first part (before the first slash)
  const parts = trimmedUserAgent.split('/');
  if (parts.length > 0 && !parts[0].includes('Bot')) {
    throw new Error(
      `FATAL: USER_AGENT first part must include "Bot".\n` +
      `Current value "${userAgent}" does not include "Bot" in the first part.\n` +
      `Expected format: BrandName Bot Environment/AppName/Version\n` +
      `Example: Podverse Bot Local/API/5`
    );
  }
};
