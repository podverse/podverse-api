import { Router } from 'express';
import { config } from '@api/config';
import { ChannelController } from '@api/controllers/channel';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/channel`, router);

router.get('/:idOrIdText', asyncHandler(ChannelController.getByIdOrIdText));
router.get('/', asyncHandler((req, res) => {
  if (req.query.type === 'subscribed') {
    return ChannelController.getManySubscribed(req, res);
  } else {
    return ChannelController.getMany(req, res);
  }
}));

export const channelRouter = router;
