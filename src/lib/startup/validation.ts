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
