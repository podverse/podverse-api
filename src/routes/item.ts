import { Router } from 'express';
import { config } from '@api/config';
import { ItemController } from '@api/controllers/item';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/item`, router);

router.get('/chapters/:item_id_text', asyncHandler(ItemController.parseAndGetChapters));

router.get('/channel/:channelIdOrIdText', asyncHandler(ItemController.getManyByChannel));

router.get('/queue/pub-date/:idText', asyncHandler(ItemController.getManyForQueueByPubDate));

router.get('/:idOrIdText', asyncHandler(ItemController.getByIdOrIdText));

router.get('/', asyncHandler((req, res) => {
  if (req.query.type === 'subscribed') {
    return ItemController.getManySubscribed(req, res);
  } else {
    return ItemController.getMany(req, res);
  }
}));

export const itemRouter = router;
