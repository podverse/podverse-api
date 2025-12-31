import Redis from 'ioredis';
import { config } from '@api/config';

const redis = new Redis({
  host: config.keyvaldb.host,
  port: config.keyvaldb.port,
  password: config.keyvaldb.password
});

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key);
    if (!val) return null;
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

export async function cacheSetJson<T>(key: string, value: T, ttlSeconds: number = config.keyvaldb.cacheTTLSeconds): Promise<void> {
  try {
    const str = JSON.stringify(value);
    await redis.set(key, str, 'EX', ttlSeconds);
  } catch {
    // swallow
  }
}

export default redis;
