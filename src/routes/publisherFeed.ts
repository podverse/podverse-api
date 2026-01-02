import { Router } from 'express';
import { config } from '@api/config';
import { PublisherFeedController } from '@api/controllers/publisherFeed';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/publisher-feed`, router);

router.get('/channel/:idOrIdText', asyncHandler(PublisherFeedController.getPublisherFeedRemoteItemsForChannel));

export const publisherFeedRouter = router;
