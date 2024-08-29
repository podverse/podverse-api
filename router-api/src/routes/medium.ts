import { Router } from 'express';
import { config } from '@router-api/config';
import { MediumController } from '@router-api/controllers/medium';
import { asyncHandler } from '@router-api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/medium-value`, router);

router.get('/', asyncHandler(MediumController.mediumsGetAll));

export const mediumRouter = router;
