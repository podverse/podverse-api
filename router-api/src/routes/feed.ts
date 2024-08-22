import { Router } from 'express';
import { config } from '@router-api/config';
import { asyncHandler } from '@router-api/middleware/asyncHandler';
import { FeedController } from '@router-api/controllers/feed';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/feed`, router);

router.post('/', asyncHandler(FeedController.create));

export const feedRouter = router;
