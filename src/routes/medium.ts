import { Router } from 'express';
import { config } from '@api/config';
import { MediumController } from '@api/controllers/medium';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/medium-value`, router);

router.get('/', asyncHandler(MediumController.mediumsGetAll));

export const mediumRouter = router;
