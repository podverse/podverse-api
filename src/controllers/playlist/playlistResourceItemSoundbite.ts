import { Request, Response } from 'express';
import Joi from 'joi';
import { PlaylistResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { verifyPlaylistOwnership } from '@api/controllers/playlist/playlist';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';

const addItemSoundbiteToPlaylistBetweenSchema = Joi.object({
  position1: Joi.number().min(0).required(),
  position2: Joi.number().min(Joi.ref('position1')).required()
}).with('position1', 'position2');

const playlistAndSoundbiteIdSchema = Joi.object({
  playlist_id_text: Joi.string().required(),
  soundbite_id_text: Joi.string().required()
});

class PlaylistResourceItemSoundbiteController {
  private static playlistResourceService = new PlaylistResourceService();

  static async addItemSoundbiteToPlaylistFirst(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndSoundbiteIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text, soundbite_id_text } = req.params;

          try {
            const playlistResource = await PlaylistResourceItemSoundbiteController.playlistResourceService.addItemSoundbiteToPlaylistFirst(playlist_id_text, soundbite_id_text);
            res.status(201).json(playlistResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addItemSoundbiteToPlaylistLast(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndSoundbiteIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text, soundbite_id_text } = req.params;

          try {
            const playlistResource = await PlaylistResourceItemSoundbiteController.playlistResourceService.addItemSoundbiteToPlaylistLast(playlist_id_text, soundbite_id_text);
            res.status(201).json(playlistResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addItemSoundbiteToPlaylistBetween(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndSoundbiteIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          validateBodyObject(addItemSoundbiteToPlaylistBetweenSchema, req, res, async () => {
            const { playlist_id_text, soundbite_id_text } = req.params;
            const { position1, position2 } = req.body;

            try {
              const playlistResource = await PlaylistResourceItemSoundbiteController.playlistResourceService.addItemSoundbiteToPlaylistBetween(playlist_id_text, soundbite_id_text, position1, position2);
              res.status(201).json(playlistResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async removeItemSoundbiteFromPlaylist(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndSoundbiteIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text, soundbite_id_text } = req.params;

          try {
            await PlaylistResourceItemSoundbiteController.playlistResourceService.removeItemSoundbiteFromPlaylist(playlist_id_text, soundbite_id_text);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }
}

export { PlaylistResourceItemSoundbiteController };