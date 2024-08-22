import { Request, Response } from 'express';
import { FeedService } from '@orm/services/feed/feed';

const feedService = new FeedService();

export class FeedController {
  static async create(req: Request, res: Response): Promise<void> {
    const { url, podcast_index_id } = req.body;
    const result = await feedService.create({ url, podcast_index_id });
    res.json(result);
  }
}
