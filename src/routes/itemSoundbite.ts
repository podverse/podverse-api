import { Router } from 'express';
import { config } from '@api/config';
import { ItemSoundbiteController } from '@api/controllers/itemSoundbite';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/item-soundbite`, router);

router.get('/:item_soundbite_id_text', asyncHandler(ItemSoundbiteController.getItemSoundbiteById));
router.get('/channel/:channel_id_text', asyncHandler(ItemSoundbiteController.getManyByChannelIdText));
router.get('/item/:item_id_text', asyncHandler(ItemSoundbiteController.getManyByItemIdText));

export const itemSoundbiteRouter = router;
