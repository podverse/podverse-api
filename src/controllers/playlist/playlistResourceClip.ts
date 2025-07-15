import { Request, Response } from 'express';
import Joi from 'joi';
import { PlaylistResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { verifyPlaylistOwnership } from '@api/controllers/playlist/playlist';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';

const addClipToPlaylistBetweenSchema = Joi.object({
  position1: Joi.number().min(0).required(),
  position2: Joi.number().min(Joi.ref('position1')).required()
}).with('position1', 'position2');

const playlistAndClipIdSchema = Joi.object({
  playlist_id_text: Joi.string().required(),
  clip_id_text: Joi.string().required()
});

class PlaylistResourceClipController {
  private static playlistResourceService = new PlaylistResourceService();

  static async addClipToPlaylistFirst(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndClipIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text, clip_id_text } = req.params;

          try {
            const playlistResource = await PlaylistResourceClipController.playlistResourceService.addClipToPlaylistFirst(playlist_id_text, clip_id_text);
            res.status(201).json(playlistResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addClipToPlaylistLast(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndClipIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          try {
            const { playlist_id_text, clip_id_text } = req.params;
            const playlistResource = await PlaylistResourceClipController.playlistResourceService.addClipToPlaylistLast(playlist_id_text, clip_id_text);
            res.status(201).json(playlistResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addClipToPlaylistBetween(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndClipIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          validateBodyObject(addClipToPlaylistBetweenSchema, req, res, async () => {
            try {
              const { playlist_id_text, clip_id_text } = req.params;
              const { position1, position2 } = req.body;
              const playlistResource = await PlaylistResourceClipController.playlistResourceService.addClipToPlaylistBetween(playlist_id_text, clip_id_text, position1, position2);
              res.status(201).json(playlistResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async removeClipFromPlaylist(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndClipIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          try {
            const { playlist_id_text, clip_id_text } = req.params;
            await PlaylistResourceClipController.playlistResourceService.removeClipFromPlaylist(playlist_id_text, clip_id_text);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }
}

export { PlaylistResourceClipController };