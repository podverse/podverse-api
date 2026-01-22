# Environment Variables

## Overview

The `podverse-api` application requires comprehensive environment variable validation on startup. All environment variables must be provided through the `.env` file - no default values are used in the configuration.

## Validation Pattern

All environment variables are validated in `src/lib/startup/validation.ts` during application startup. The validation:

1. Checks if each variable is set
2. Validates format/type where applicable (e.g., UUID for JWT secret, numeric for ports)
3. Displays a true/false status for each variable
4. Enforces conditional requirements based on `ACCOUNT_SIGNUP_MODE`
5. Aborts startup if any required variables are missing or invalid

## Always Required Variables

These variables are **always required** regardless of configuration:

### Auth & Security
- `AUTH_JWT_SECRET` - Must be a valid UUID
- `USER_AGENT` - Must follow format: `BrandName Bot Environment/AppName/Version` (e.g., "Podverse Bot Local/API/5")

### Database
- `DB_HOST`
- `DB_PORT` - Must be a valid number
- `DB_READ_USERNAME`
- `DB_READ_PASSWORD`
- `DB_READ_WRITE_USERNAME`
- `DB_READ_WRITE_PASSWORD`
- `DB_DATABASE`
- `DB_SSL_CONNECTION` (optional)

### API Configuration
- `API_PORT` - Must be a valid number
- `API_PREFIX`
- `API_VERSION`
- `COOKIE_DOMAIN`
- `API_ALLOWED_CORS_ORIGINS` - Must contain at least one origin (comma-separated)

### Web
- `WEB_PROTOCOL`
- `WEB_DOMAIN`

### Message Queue
- `MESSAGE_QUEUE_PROTOCOL`
- `MESSAGE_QUEUE_HOST`
- `MESSAGE_QUEUE_USERNAME`
- `MESSAGE_QUEUE_PASSWORD`
- `MESSAGE_QUEUE_PORT` - Must be a valid number

### Key-Value DB
- `KEYVALDB_HOST` (required)
- `KEYVALDB_PORT` (required) - Must be a valid number
- `KEYVALDB_PASSWORD` (required) - Password for KeyValDB authentication
- `KEYVALDB_CACHE_TTL_SECONDS` (required) - Must be a valid number

### Podcast Index
- `PODCAST_INDEX_AUTH_KEY`
- `PODCAST_INDEX_BASE_URL`
- `PODCAST_INDEX_SECRET_KEY`

### Premium/Membership
- `ACCOUNT_SIGNUP_MODE` - Must be either `'sign-up'` or `'contact-only'`
- `PREMIUM_MEMBERSHIP_COST_MONTHLY` (optional)
- `PREMIUM_MEMBERSHIP_COST_ANNUALLY` (optional)
- `FREE_TRIAL_EXPIRATION` (optional)

## Conditionally Required Variables

These variables are **required only when `ACCOUNT_SIGNUP_MODE` is set to `'sign-up'`**. When `ACCOUNT_SIGNUP_MODE` is `'contact-only'`, these variables are optional.

### Mailer
- `MAILER_HOST`
- `MAILER_PORT` - Must be a valid number
- `MAILER_USERNAME`
- `MAILER_PASSWORD`
- `MAILER_FROM`
- `MAILER_DISABLED` (optional)

### Email Configuration
- `EMAIL_BRAND_COLOR`
- `EMAIL_HEADER_IMAGE_URL`
- `LEGAL_NAME`
- `LEGAL_ADDRESS`

### Token Expiration
- `VERIFY_EMAIL_TOKEN_EXPIRATION` - Must be a valid number
- `EMAIL_CHANGE_VERIFICATION_TOKEN_EXPIRATION` - Must be a valid number
- `RESET_PASSWORD_TOKEN_EXPIRATION` - Must be a valid number

### Page Paths
- `VERIFY_EMAIL_PAGE_PATH`
- `EMAIL_CHANGE_VERIFICATION_PAGE_PATH`
- `RESET_PASSWORD_PAGE_PATH`

## Optional Variables

These variables are optional but will still be validated if set:

### Social Media
- `SOCIAL_FACEBOOK_PAGE_URL` - Used when signup mode is 'sign-up' but not required
- `SOCIAL_FACEBOOK_IMAGE_URL` - Used when signup mode is 'sign-up' but not required
- `SOCIAL_GITHUB_PAGE_URL` - Used when signup mode is 'sign-up' but not required
- `SOCIAL_GITHUB_IMAGE_URL` - Used when signup mode is 'sign-up' but not required
- `SOCIAL_REDDIT_PAGE_URL` - Used when signup mode is 'sign-up' but not required
- `SOCIAL_REDDIT_IMAGE_URL` - Used when signup mode is 'sign-up' but not required
- `SOCIAL_TWITTER_PAGE_URL` - Used when signup mode is 'sign-up' but not required
- `SOCIAL_TWITTER_IMAGE_URL` - Used when signup mode is 'sign-up' but not required

### PayPal
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

### General
- `NODE_ENV`
- `LOG_LEVEL`

## Adding New Environment Variables

When adding a new environment variable to the application:

1. **Add to `src/config/index.ts`**:
   - Remove any default values (use `process.env.VAR_NAME!`)
   - Add the variable to the appropriate config section

2. **Add validation to `src/lib/startup/validation.ts`**:
   - Determine if the variable is:
     - Always required
     - Conditionally required (based on `ACCOUNT_SIGNUP_MODE` or other conditions)
     - Optional
   - Add appropriate validation call in `validateAllEnvironmentVariables()`
   - Use `validateRequired()` for required vars
   - Use `validateOptional()` for optional vars
   - Add custom validation if format/type checking is needed

3. **Update this skills file**:
   - Add the variable to the appropriate section above
   - Document any special requirements (format, type, conditional logic)

4. **Update `.env.example`** (if applicable):
   - Add the variable with a comment explaining its purpose

## Validation Output

The validation displays:
- A categorized list of all environment variables
- Status indicator (✓ for valid, ✗ for invalid)
- Whether the variable is required or optional
- Conditional requirements (e.g., "required when signup mode is 'sign-up'")
- A message indicating the validation result
- A summary with totals and counts

Example output:
```
=== Environment Variable Validation ===

[Auth & Security]
  ✓ AUTH_JWT_SECRET (required) - Valid UUID
  ✓ USER_AGENT (required) - Valid format

[Database]
  ✓ DB_HOST (required) - Set
  ✓ DB_PORT (required) - Set
  ...

=== Validation Summary ===
Total: 45
Passed: 42
Failed: 3
Required Missing: 2
```

## Important Notes

- **No default values**: The application must 100% depend on values from the `.env` file. All defaults have been removed from `config/index.ts`.
- **Conditional requirements**: Always check `ACCOUNT_SIGNUP_MODE` when determining if mailer, email config, social media, token expiration, and page path variables are required.
- **Numeric validation**: Variables containing `PORT`, `EXPIRATION`, or `CACHE_TTL` are validated to ensure they are valid positive numbers.
- **Startup abort**: If any required variable is missing or invalid, the application will abort startup with a clear error message.
