import Redis from 'ioredis';
import { config } from '@api/config';
import { loggerService } from '@api/factories/loggerService';

const keyvaldb = new Redis({
  host: config.keyvaldb.host,
  port: config.keyvaldb.port,
  password: config.keyvaldb.password,
  retryStrategy: (times) => {
    // Stop retrying after 3 attempts to prevent endless reconnection loops
    if (times > 3) {
      return null; // Return null to stop retrying
    }
    // Exponential backoff: 200ms, 400ms, 800ms
    return Math.min(times * 200, 3000);
  },
  maxRetriesPerRequest: 1, // Limit retries per request
  enableOfflineQueue: false, // Don't queue commands when disconnected
});

// Track if we've already logged the connection error to avoid spam
let connectionErrorLogged = false;

// Handle connection errors to prevent unhandled error events
keyvaldb.on('error', (err) => {
  // Only log the error once to avoid spam
  if (!connectionErrorLogged) {
    connectionErrorLogged = true;
    // Log at debug level since we already warn about connection failure on startup
    loggerService.debug(`KeyValDB connection error: ${err.message}`);
  }
});

// Reset error logged flag on successful connection
keyvaldb.on('connect', () => {
  connectionErrorLogged = false;
});

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  try {
    const val = await keyvaldb.get(key);
    if (!val) return null;
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

export async function cacheSetJson<T>(key: string, value: T, ttlSeconds: number = config.keyvaldb.cacheTTLSeconds): Promise<void> {
  try {
    const str = JSON.stringify(value);
    await keyvaldb.set(key, str, 'EX', ttlSeconds);
  } catch {
    // swallow
  }
}

/**
 * Tests the connection to KeyValDB by sending a PING command.
 * @returns Promise<boolean> - true if connection is available, false otherwise
 */
export async function testKeyvaldbConnection(): Promise<boolean> {
  try {
    // Add timeout to prevent hanging if Redis is unreachable
    const pingPromise = keyvaldb.ping();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection test timeout')), 5000);
    });
    await Promise.race([pingPromise, timeoutPromise]);
    return true;
  } catch {
    return false;
  }
}

export { keyvaldb };
