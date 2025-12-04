import { Router } from 'express';
import { config } from '@api/config';
import { ClipController } from '@api/controllers/clip';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();
router.use(`${config.api.prefix}${config.api.version}/clip`, router);

router.get('/public/recent', asyncHandler(ClipController.getManyPublicRecent));
router.get('/public/oldest', asyncHandler(ClipController.getManyPublicOldest));
router.get('/public/top', asyncHandler(ClipController.getManyPublicTop));

router.get('/public/category/recent', asyncHandler(ClipController.getManyByCategoryPublicRecent));
router.get('/public/category/oldest', asyncHandler(ClipController.getManyByCategoryPublicOldest));
router.get('/public/category/top', asyncHandler(ClipController.getManyByCategoryPublicTop));

router.get('/public/channel/recent/:channel_id_text', asyncHandler(ClipController.getManyByChannelPublicRecent));
router.get('/public/channel/oldest/:channel_id_text', asyncHandler(ClipController.getManyByChannelPublicOldest));
router.get('/public/channel/top/:channel_id_text', asyncHandler(ClipController.getManyByChannelPublicTop));

router.get('/public/item/recent/:item_id_text', asyncHandler(ClipController.getManyByItemPublicRecent));
router.get('/public/item/oldest/:item_id_text', asyncHandler(ClipController.getManyByItemPublicOldest));
router.get('/public/item/top/:item_id_text', asyncHandler(ClipController.getManyByItemPublicTop));

router.get('/public/subscribed/recent', asyncHandler(ClipController.getManySubscribedPublicRecent));
router.get('/public/subscribed/top', asyncHandler(ClipController.getManySubscribedPublicTop));

router.get('/private', asyncHandler(ClipController.getClipsPrivate));

router.post('/', asyncHandler(ClipController.createClip));
router.get('/:clip_id_text', asyncHandler(ClipController.getClipByIdText));
router.patch('/:clip_id_text', asyncHandler(ClipController.updateClip));
router.delete('/:clip_id_text', asyncHandler(ClipController.deleteClip));

export const clipRouter = router;
