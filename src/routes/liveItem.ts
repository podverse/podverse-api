import { Router } from 'express';
import { config } from '@api/config';
import { LiveItemController } from '@api/controllers/liveItem';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/live-item`, router);

router.get('/global/recent', asyncHandler(LiveItemController.getManyGlobalRecent));
router.get('/global/top', asyncHandler(LiveItemController.getManyGlobalTop));

router.get('/category/recent', asyncHandler(LiveItemController.getManyCategoryRecent));
router.get('/category/top', asyncHandler(LiveItemController.getManyCategoryTop));

router.get('/subscribed/recent', asyncHandler(LiveItemController.getManySubscribedRecent));
router.get('/subscribed/top', asyncHandler(LiveItemController.getManySubscribedTop));

router.get('/channel/:channelIdOrIdText', asyncHandler(LiveItemController.getManyByChannel));

export const liveItemRouter = router;
