import { Router } from 'express';
import { config } from '@api/config';
import { MembershipController } from '@api/controllers/membership';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/membership`, router);

router.get('/pricing', asyncHandler(MembershipController.getPricing));

export const membershipRouter = router;
