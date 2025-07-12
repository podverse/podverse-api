import { Router } from 'express';
import { config } from '@api/config';
import { MembershipClaimTokenController } from '@api/controllers/membershipClaimToken';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();
const membershipClaimTokenController = new MembershipClaimTokenController();

router.use(`${config.api.prefix}${config.api.version}/membership-claim-token`, router);

router.post('/claim/:token', asyncHandler((req, res) => membershipClaimTokenController.claim(req, res)));

export const membershipClaimTokenRouter = router;
