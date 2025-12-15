import { OnDemandParserEventType } from 'podverse-helpers';
import { Router } from 'express';
import { config } from '@api/config';
import { MQController } from '@api/controllers/mq/mq';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/mq`, router);

router.post('/rss/add/on-demand', asyncHandler(MQController.rssAddToOnDemandMQ(OnDemandParserEventType.ADD)));

router.post('/rss/refresh/on-demand', asyncHandler(MQController.rssAddToOnDemandMQ(OnDemandParserEventType.REFRESH)));

export const mqRouter = router;
