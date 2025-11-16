import { Request, Response } from 'express';
import Joi from 'joi';
import { podcastIndexService } from '@api/factories/podcastIndexService';
import { validateQueryObject } from '@api/lib/validation';

export const searchPodcastsQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).required()
}).unknown(false);

interface SearchPodcastsQuery { q?: string }

export class SearchPodcastIndexController {
  static async searchPodcasts(req: Request, res: Response): Promise<void> {
    validateQueryObject(searchPodcastsQuerySchema, req, res,
      async () => {
        const { q } = req.query as unknown as SearchPodcastsQuery;
        const results = await podcastIndexService.searchPodcasts(q || "", {});

        if (!results) {
          res.status(500).json({ error: 'Failed to fetch search results from Podcast Index' });
          return;
        }

        res.json(results);
      }
    );
  }
}
