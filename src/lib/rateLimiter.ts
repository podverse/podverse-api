import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { ensureAuthenticated } from '@api/lib/auth';

export interface RateLimitAuthOptions {
  windowMs: number;
  max: number;
}

/**
 * Per-user rate limiting requiring authentication.
 * Returns JSON when limit reached.
 */
export function rateLimitAuthEndpoint(options: RateLimitAuthOptions) {
  const { windowMs, max } = options;

  const keyGenerator = (req: Request) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user?.id || (req as any).user?.userId;
    if (!userId) {
      throw new Error('Authentication required');
    }
    return `user:${userId}`;
  };

  const limiter = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req: Request, res: Response) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resetTime = (req as any).rateLimit?.resetTime as Date | undefined;
      const timeUntilResetMs = resetTime
        ? resetTime.getTime()
        : Date.now() + windowMs;
      res.status(429).json({
        tooManyRequests: true,
        timeUntilResetMs
      });
    },
    message: undefined // ensure default text message not sent
  });

  return (req: Request, res: Response, next: NextFunction) => {
    ensureAuthenticated(req, res, () => {
      try {
        limiter(req, res, next);
      } catch {
        res.status(401).json({ error: 'Authentication required' });
      }
    });
  };
}