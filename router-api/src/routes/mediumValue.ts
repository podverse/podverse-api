import { Router } from 'express';
import { config } from '@router-api/config';
import { MediumValueController } from '@router-api/controllers/mediumValue';
import { asyncHandler } from '@router-api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/medium-value`, router);

router.get('/', asyncHandler(MediumValueController.mediumValuesGetAll));

export default router;
