import { Router, Request, Response } from 'express';
import { config } from '@router-api/config';
import { MediumValueService } from '@orm/services/mediumValue';

const mediumValueService = new MediumValueService();

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/channel`, router);

router.get('/', async (req: Request, res: Response) => {
  const result = await mediumValueService.mediumValueGetAll();

  res.json(result);
});

export default router;
