import { Request, Response } from 'express';
import Joi from 'joi';
import { PlaylistResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { verifyPlaylistOwnership } from '@api/controllers/playlist';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';

const addChapterToPlaylistBetweenSchema = Joi.object({
  position1: Joi.number().min(0).required(),
  position2: Joi.number().min(Joi.ref('position1')).required()
}).with('position1', 'position2');

const playlistAndChapterIdSchema = Joi.object({
  playlist_id_text: Joi.string().required(),
  item_chapter_id_text: Joi.string().required()
});

class PlaylistResourceItemChapterController {
  private static playlistResourceService = new PlaylistResourceService();

  static async addChapterToPlaylistFirst(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndChapterIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text, item_chapter_id_text } = req.params;

          try {
            const playlistResource = await PlaylistResourceItemChapterController.playlistResourceService.addItemChapterToPlaylistFirst(playlist_id_text, item_chapter_id_text);
            res.status(201).json(playlistResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addChapterToPlaylistLast(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndChapterIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text, item_chapter_id_text } = req.params;

          try {
            const playlistResource = await PlaylistResourceItemChapterController.playlistResourceService.addItemChapterToPlaylistLast(playlist_id_text, item_chapter_id_text);
            res.status(201).json(playlistResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addChapterToPlaylistBetween(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndChapterIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          validateBodyObject(addChapterToPlaylistBetweenSchema, req, res, async () => {
            const { playlist_id_text, item_chapter_id_text } = req.params;
            const { position1, position2 } = req.body;

            try {
              const playlistResource = await PlaylistResourceItemChapterController.playlistResourceService.addItemChapterToPlaylistBetween(playlist_id_text, item_chapter_id_text, position1, position2);
              res.status(201).json(playlistResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async removeChapterFromPlaylist(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndChapterIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text, item_chapter_id_text } = req.params;

          try {
            await PlaylistResourceItemChapterController.playlistResourceService.removeItemChapterFromPlaylist(playlist_id_text, item_chapter_id_text);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }
}

export { PlaylistResourceItemChapterController };