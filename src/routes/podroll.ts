import { Router } from 'express';
import { config } from '@api/config';
import { PodrollController } from '@api/controllers/podroll';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/podroll`, router);

router.get('/channel/:idOrIdText', asyncHandler(PodrollController.getPodrollForChannel));

export const podrollRouter = router;
