import { Router } from 'express';
import { config } from '@api/config';
import { ItemController } from '@api/controllers/item';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/item`, router);

router.get('/chapters/:item_id_text', asyncHandler(ItemController.parseAndGetChapters));

router.get('/channel/season/forward/:channelIdOrIdText', asyncHandler(ItemController.getManyByChannelBySeasonForward));
router.get('/channel/season/backward/:channelIdOrIdText', asyncHandler(ItemController.getManyByChannelBySeasonBackward));

router.get('/channel/recent/:channelIdOrIdText', asyncHandler(ItemController.getManyByChannelRecent));
router.get('/channel/oldest/:channelIdOrIdText', asyncHandler(ItemController.getManyByChannelOldest));
router.get('/channel/top/:channelIdOrIdText', asyncHandler(ItemController.getManyByChannelTop));

router.get('/channel/shuffle/:channelIdOrIdText', asyncHandler(ItemController.getManyByChannelShuffle));

router.get('/queue/pub-date/:idText', asyncHandler(ItemController.getManyForQueueByPubDate));
router.get('/queue/season/:idText', asyncHandler(ItemController.getManyForQueueBySeason));

router.get('/global/recent', asyncHandler(ItemController.getManyGlobalRecent));
router.get('/global/top', asyncHandler(ItemController.getManyGlobalTop));

router.get('/category/recent', asyncHandler(ItemController.getManyCategoryRecent));
router.get('/category/top', asyncHandler(ItemController.getManyCategoryTop));

router.get('/subscribed/recent', asyncHandler(ItemController.getManySubscribedRecent));
router.get('/subscribed/top', asyncHandler(ItemController.getManySubscribedTop));

router.get('/:idOrIdText', asyncHandler(ItemController.getByIdOrIdText));

export const itemRouter = router;
