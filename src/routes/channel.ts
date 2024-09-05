import { Router, Request, Response } from 'express';
import { MediumService } from 'podverse-orm';
import { config } from '@api/config';

const mediumService = new MediumService();

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/channel`, router);

router.get('/', async (req: Request, res: Response) => {
  const result = await mediumService.mediumGetAll();

  res.json(result);
});

export const channelRouter = router;
