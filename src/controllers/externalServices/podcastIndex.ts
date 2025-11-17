import { Request, Response } from 'express';
import Joi from 'joi';
import { podcastIndexService } from '@api/factories/podcastIndexService';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';

const podcastIndexFeedParamsSchema = Joi.object({
  podcastIndexId: Joi.number().integer().required()
}).unknown(false);

const podcastIndexSearchPodcastsQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).required()
}).unknown(false);

interface PodcastIndexSearchPodcastsQuery {
  q: string
}

export class PodcastIndexController {

  static async podcastById(req: Request, res: Response): Promise<void> {
    validateParamsObject(podcastIndexFeedParamsSchema, req, res,
      async () => {
        const { podcastIndexId } = req.params as unknown as { podcastIndexId: number };
        const result = await podcastIndexService.podcastGetById(podcastIndexId);

        if (!result) {
          res.status(500).json({ error: 'Failed to fetch podcast from Podcast Index' });
          return;
        }

        res.json(result);
      }
    );
  }

  static async searchPodcasts(req: Request, res: Response): Promise<void> {
    validateQueryObject(podcastIndexSearchPodcastsQuerySchema, req, res,
      async () => {
        const { q } = req.query as unknown as PodcastIndexSearchPodcastsQuery;
        const options = { max: 50 };
        const results = await podcastIndexService.searchPodcasts(q, options);

        if (!results) {
          res.status(500).json({ error: 'Failed to fetch search results from Podcast Index' });
          return;
        }

        res.json(results);
      }
    );
  }
}
