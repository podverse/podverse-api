import { Router } from 'express';
import { config } from '@api/config';
import { ItemTranscriptController } from '@api/controllers/itemTranscript';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/item-transcript`, router);

router.get('/:item_id_text', asyncHandler(ItemTranscriptController.getByIdOrIdText));

export const itemTranscriptRouter = router;
