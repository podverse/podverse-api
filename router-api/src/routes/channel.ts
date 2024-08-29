import { Router, Request, Response } from 'express';
import { config } from '@router-api/config';
import { MediumService } from '@orm/services/medium';

const mediumService = new MediumService();

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/channel`, router);

router.get('/', async (req: Request, res: Response) => {
  const result = await mediumService.mediumGetAll();

  res.json(result);
});

export const channelRouter = router;
