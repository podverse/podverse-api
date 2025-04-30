import { Request, Response } from 'express';
import Joi from 'joi';
import { PlaylistResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { verifyPlaylistOwnership } from '@api/controllers/playlist';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';

const addItemToPlaylistSchema = Joi.object({
  add_by_rss_resource_data: Joi.object().required()
});

const addItemToPlaylistBetweenSchema = Joi.object({
  add_by_rss_resource_data: Joi.object().required(),
  position1: Joi.number().min(0).required(),
  position2: Joi.number().min(Joi.ref('position1')).required()
}).with('position1', 'position2');

const playlistAndRSSHashIdSchema = Joi.object({
  playlist_id_text: Joi.string().required(),
  add_by_rss_hash_id: Joi.string().required()
});

const playlistIdSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

class PlaylistResourceItemAddByRSSController {
  private static playlistResourceService = new PlaylistResourceService();

  static async addItemAddByRSSToPlaylistFirst(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          validateBodyObject(addItemToPlaylistSchema, req, res, async () => {
            const { playlist_id_text } = req.params;
            const { add_by_rss_resource_data } = req.body;

            try {
              const playlistResource = await PlaylistResourceItemAddByRSSController.playlistResourceService.addItemAddByRSSToPlaylistFirst(playlist_id_text, add_by_rss_resource_data);
              res.status(201).json(playlistResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async addItemAddByRSSToPlaylistLast(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          validateBodyObject(addItemToPlaylistSchema, req, res, async () => {
            const { playlist_id_text } = req.params;
            const { add_by_rss_resource_data } = req.body;

            try {
              const playlistResource = await PlaylistResourceItemAddByRSSController.playlistResourceService.addItemAddByRSSToPlaylistLast(playlist_id_text, add_by_rss_resource_data);
              res.status(201).json(playlistResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async addItemAddByRSSToPlaylistBetween(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          validateBodyObject(addItemToPlaylistBetweenSchema, req, res, async () => {
            const { playlist_id_text } = req.params;
            const { add_by_rss_resource_data, position1, position2 } = req.body;

            try {
              const playlistResource = await PlaylistResourceItemAddByRSSController.playlistResourceService.addItemAddByRSSToPlaylistBetween(playlist_id_text, add_by_rss_resource_data, position1, position2);
              res.status(201).json(playlistResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async removeItemAddByRSSFromPlaylist(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistAndRSSHashIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text, add_by_rss_hash_id } = req.params;

          try {
            await PlaylistResourceItemAddByRSSController.playlistResourceService.removeItemAddByRSSFromPlaylist(playlist_id_text, add_by_rss_hash_id);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }
}

export { PlaylistResourceItemAddByRSSController };
