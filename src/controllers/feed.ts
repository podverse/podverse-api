import { Request, Response } from 'express';
import Joi from 'joi';
import { FeedService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { validateParamsObject } from '@api/lib/validation';
import { getParamRequired } from '@api/lib/params';

const getFeedByPodcastIndexIdSchema = Joi.object({
  podcast_index_id: Joi.number().integer().min(1).required()
});

export class FeedController {
  private static feedService = new FeedService();

  // Always return 200 on not found. This is to prevent unnecessary 404 error handling
  // in the SSR next.js app.
  static async getByPodcastIndexId(req: Request, res: Response): Promise<void> {
    validateParamsObject(getFeedByPodcastIndexIdSchema, req, res, async () => {
      try {
        const podcast_index_id = getParamRequired(req, 'podcast_index_id');
        const numericId = parseInt(podcast_index_id, 10);
        const data = await FeedController.feedService.getByPodcastIndexId(numericId);
        
        res.json(data || null);
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }
}
