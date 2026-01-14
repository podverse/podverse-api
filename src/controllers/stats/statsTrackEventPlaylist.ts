import { Request, Response } from 'express';
import Joi from 'joi';
import { StatsTrackEventPlaylistService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateBodyObject } from '@api/lib/validation';

const createStatsTrackEventPlaylistSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

export class StatsTrackEventPlaylistController {
  private static statsTrackEventPlaylistService = new StatsTrackEventPlaylistService();

  static async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(createStatsTrackEventPlaylistSchema, req, res, async () => {
        const jwtUser = req.user!;
        const { playlist_id_text } = req.body;

        try {
          await StatsTrackEventPlaylistController.statsTrackEventPlaylistService._create(jwtUser.id, playlist_id_text);
          res.status(201).json({ message: 'Event logged successfully' });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    }, { skipMembershipStatus: false });
  }
}