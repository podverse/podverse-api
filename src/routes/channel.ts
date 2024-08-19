import { Router, Request, Response } from 'express';
import { config } from '@/config';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/channel`, router);

router.get('/', (req: Request, res: Response) => {
  res.json([]);
});

export default router;
