import { Router } from 'express';
import { config } from '@api/config';
import { FeedController } from '@api/controllers/feed';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/feed`, router);

router.post('/', asyncHandler(FeedController.create));

export const feedRouter = router;
