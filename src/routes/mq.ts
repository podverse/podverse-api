import { Router } from 'express';
import { config } from '@api/config';
import { MQController } from '@api/controllers/mq/mq';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/mq`, router);

router.post('/add-to-on-demand', asyncHandler(MQController.addToOnDemandMQ));

export const mqRouter = router;
