import { Request, Response } from 'express';
import Joi from 'joi';
import { PlaylistResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '../helpers/error';
import { validateParamsObject } from '@api/lib/validation';

const playlistIdSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

class PlaylistResourceController {
  private static playlistResourceService = new PlaylistResourceService();

  static async getAllByPlaylistIdPublic(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistIdSchema, req, res, async () => {
      const { playlist_id_text } = req.params;

      try {
        const playlistResources = await PlaylistResourceController.playlistResourceService.getAllByPlaylistIdText(playlist_id_text);
        res.status(200).json(playlistResources);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }
}

export { PlaylistResourceController };
