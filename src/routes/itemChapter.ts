import { Router } from 'express';
import { config } from '@api/config';
import { ItemChapterController } from '@api/controllers/itemChapter';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/item-chapter`, router);

router.get('/:item_chapter_id_text', asyncHandler(ItemChapterController.getItemChapterByIdText));

export const itemChapterRouter = router;
