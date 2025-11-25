import { Router } from 'express';
import { config } from '@api/config';
import { ChannelController } from '@api/controllers/channel';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/channel`, router);

router.get('/podcast-index/:podcast_index_id', asyncHandler(ChannelController.getbyPodcastIndexId));

router.get('/global/recent', asyncHandler(ChannelController.getManyGlobalRecent));
router.get('/global/top', asyncHandler(ChannelController.getManyGlobalTop));

router.get('/category/recent', asyncHandler(ChannelController.getManyCategoryRecent));
router.get('/category/top', asyncHandler(ChannelController.getManyCategoryTop));

router.get('/subscribed/az', asyncHandler(ChannelController.getManySubscribedAZ));
router.get('/subscribed/recent', asyncHandler(ChannelController.getManySubscribedRecent));
router.get('/subscribed/top', asyncHandler(ChannelController.getManySubscribedTop));

router.get('/:idOrIdText', asyncHandler(ChannelController.getByIdOrIdText));

export const channelRouter = router;
