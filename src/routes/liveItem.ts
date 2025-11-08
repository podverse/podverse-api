import { Router } from 'express';
import { config } from '@api/config';
import { LiveItemController } from '@api/controllers/liveItem';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/live-item`, router);

router.get('/channel/:channelIdOrIdText', asyncHandler(LiveItemController.getManyByChannel));

export const liveItemRouter = router;
