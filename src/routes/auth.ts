import { Router } from 'express';
import { config } from '@api/config';
import { AccountController } from '@api/controllers/account/account';
import { authenticate, logout } from '@api/lib/auth';
import { rateLimitEndpoint } from '@api/lib/rateLimiter';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/auth`, router);

router.post('/login', rateLimitEndpoint({ windowMs: 60 * 1000, max: 5 }), authenticate);
router.post('/logout', logout);

router.get('/me', asyncHandler(AccountController.getLoggedInAccount));
router.get('/check-session', asyncHandler(AccountController.checkIfValidAuthSession));

export const authRouter = router;
