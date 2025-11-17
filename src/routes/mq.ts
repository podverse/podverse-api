import { Router } from 'express';
import { config } from '@api/config';
import { MQController } from '@api/controllers/mq/mq';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/mq`, router);

router.post('/rss/add/on-demand', asyncHandler(MQController.rssAddToOnDemandMQ));

export const mqRouter = router;
