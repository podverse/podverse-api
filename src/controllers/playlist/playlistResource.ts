import { Request, Response } from 'express';
import Joi from 'joi';
import { PlaylistResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '../helpers/error';
import { validateParamsObject } from '@api/lib/validation';
import { verifyPlaylistOwnership, verifyPrivatePlaylistOwnershipIfNeeded } from './playlist';
import { ensureAuthenticated, optionalEnsureAuthenticated } from '@api/lib/auth';
import { getPaginationParams } from '../helpers/pagination';

const playlistIdSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

class PlaylistResourceController {
  private static playlistResourceService = new PlaylistResourceService();

  static async getAllByPlaylistIdTextPrivate(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text } = req.params;
          
          try {
            const playlistResources = await PlaylistResourceController.playlistResourceService.getAllByPlaylistIdText(playlist_id_text);
            res.status(200).json(playlistResources);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getManyByPlaylistIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistIdSchema, req, res, async () => {
      optionalEnsureAuthenticated(req, res, async () => {
        verifyPrivatePlaylistOwnershipIfNeeded()(req, res, async () => {
          const { playlist_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);

          try {
            const playlistResources = await PlaylistResourceController
              .playlistResourceService.getManyByPlaylistIdText(
                playlist_id_text,
                {
                  skip: offset,
                  take: limit
                }
              );
            const totalCount = await PlaylistResourceController
              .playlistResourceService.getAllByPlaylistIdTextCount(playlist_id_text);

            res.status(200).json({
              data: playlistResources,
              meta: { page, count: totalCount, limit }
            });
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }
}

export { PlaylistResourceController };
