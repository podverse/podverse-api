import { Request } from 'express';

/**
 * Safely extracts a route parameter from req.params as a string.
 * 
 * Express 5 types params as `string | string[]` to support wildcard routes,
 * but this codebase only uses standard routes that always produce strings.
 * This helper ensures type safety without requiring type assertions.
 * 
 * @param req - Express request object
 * @param key - Parameter key name
 * @returns The parameter value as a string, or undefined if not present
 */
export const getParam = (req: Request, key: string): string | undefined => {
  const value = req.params[key];
  if (value === undefined) {
    return undefined;
  }
  // If it's an array (shouldn't happen with standard routes), take first element
  return Array.isArray(value) ? value[0] : value;
};

/**
 * Safely extracts a route parameter from req.params as a string, throwing if missing.
 * 
 * @param req - Express request object
 * @param key - Parameter key name
 * @returns The parameter value as a string
 * @throws Error if parameter is missing
 */
export const getParamRequired = (req: Request, key: string): string => {
  const value = getParam(req, key);
  if (value === undefined) {
    throw new Error(`Required parameter '${key}' is missing`);
  }
  return value;
};
