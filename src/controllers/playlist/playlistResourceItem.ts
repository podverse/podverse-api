import { Request, Response } from 'express';
import Joi from 'joi';
import { PlaylistResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { verifyPlaylistOwnership } from '@api/controllers/playlist/playlist';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';

const addItemToPlaylistBetweenSchema = Joi.object({
  position1: Joi.number().min(0).required(),
  position2: Joi.number().min(Joi.ref('position1')).required()
}).with('position1', 'position2');

const playlistAndItemIdSchema = Joi.object({
  playlist_id_text: Joi.string().required(),
  item_id_text: Joi.string().required()
});

class PlaylistResourceItemController {
  private static playlistResourceService = new PlaylistResourceService();

  static async addItemToPlaylistFirst(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndItemIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text, item_id_text } = req.params;

          try {
            const playlistResource = await PlaylistResourceItemController.playlistResourceService.addItemToPlaylistFirst(playlist_id_text, item_id_text);
            res.status(201).json(playlistResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addItemToPlaylistLast(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndItemIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          try {
            const { playlist_id_text, item_id_text } = req.params;
            const playlistResource = await PlaylistResourceItemController.playlistResourceService.addItemToPlaylistLast(playlist_id_text, item_id_text);
            res.status(201).json(playlistResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addItemToPlaylistBetween(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndItemIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          validateBodyObject(addItemToPlaylistBetweenSchema, req, res, async () => {
            try {
              const { playlist_id_text, item_id_text } = req.params;
              const { position1, position2 } = req.body;
              const playlistResource = await PlaylistResourceItemController.playlistResourceService.addItemToPlaylistBetween(playlist_id_text, item_id_text, position1, position2);
              res.status(201).json(playlistResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async removeItemFromPlaylist(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndItemIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          try {
            const { playlist_id_text, item_id_text } = req.params;
            await PlaylistResourceItemController.playlistResourceService.removeItemFromPlaylist(playlist_id_text, item_id_text);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }
}

export { PlaylistResourceItemController };