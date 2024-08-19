import { Router, Request, Response } from 'express';
import { config } from '@/config';
import { AppDataSource } from '@/db';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/channel`, router);

router.get('/', async (req: Request, res: Response) => {

  const result = await AppDataSource.query('SELECT * FROM sharable_status');

  res.json(result);
});

export default router;
