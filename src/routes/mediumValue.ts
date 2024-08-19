import { Router } from 'express';
import { config } from '@/config';
import { MediumValueController } from '@/controllers/mediumValue';
import { asyncHandler } from '@/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/medium-value`, router);

router.get('/', asyncHandler(MediumValueController.mediumValuesGetAll));

export default router;
