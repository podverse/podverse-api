import { Request, Response } from 'express';
import Joi from 'joi';
import { PlaylistResourceIdTextOptions } from 'podverse-helpers';
import { FindManyOptions, PlaylistResource, PlaylistResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '../helpers/error';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { verifyPlaylistOwnership, verifyPrivatePlaylistOwnershipIfNeeded } from './playlist';
import { ensureAuthenticated, optionalEnsureAuthenticated } from '@api/lib/auth';
import { getPaginationParams } from '../helpers/pagination';

const playlistIdSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

const getManyForQueueByListPositionParamsSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

const getManyForQueueByListPositionQuerySchema = Joi.object({
  item_id_text: Joi.string().optional(),
  clip_id_text: Joi.string().optional(),
  item_soundbite_id_text: Joi.string().optional(),
  direction: Joi.string().valid('forward', 'backward').required()
});

const getManyByPlaylistShuffleParamsSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

const getManyByPlaylistShuffleQuerySchema = Joi.object({
  shuffleHash: Joi.string().required(),
  page: Joi.number().integer().min(1).default(1)
});

class PlaylistResourceController {
  private static playlistResourceService = new PlaylistResourceService();

  static async getAllByPlaylistIdTextPrivate(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const { playlist_id_text } = req.params;
          const account_id = req.user!.id;
          
          try {
            const playlistResources = await PlaylistResourceController.playlistResourceService.getAllByPlaylistIdText(
              playlist_id_text,
              account_id
            );
            res.status(200).json(playlistResources);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getManyForQueueByListPosition(req: Request, res: Response): Promise<void> {
    validateParamsObject(getManyForQueueByListPositionParamsSchema, req, res, async () => {
      validateQueryObject(getManyForQueueByListPositionQuerySchema, req, res, async () => {
        optionalEnsureAuthenticated(req, res, async () => {
          const { playlist_id_text } = req.params;
          const {
            item_id_text,
            clip_id_text,
            item_soundbite_id_text,
            direction
          } = req.query as {
            item_id_text?: PlaylistResourceIdTextOptions['item_id_text'];
            clip_id_text?: PlaylistResourceIdTextOptions['clip_id_text'];
            item_soundbite_id_text?: PlaylistResourceIdTextOptions['item_soundbite_id_text'];
            direction: 'forward' | 'backward';
          };
          const account_id = req.user?.id || null;

          if (!item_id_text && !clip_id_text && !item_soundbite_id_text) {
            res.status(400).json({ message: 'One of item_id_text, clip_id_text, or item_soundbite_id_text must be provided' });
            return;
          }

          try {
            const playlistResources = await PlaylistResourceController
              .playlistResourceService
              .getManyForQueueByListPosition(
                playlist_id_text,
                { item_id_text, clip_id_text, item_soundbite_id_text },
                direction,
                account_id
              );
            res.json({ data: playlistResources });
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getManyByPlaylistShuffle(req: Request, res: Response): Promise<void> {
    validateParamsObject(getManyByPlaylistShuffleParamsSchema, req, res, async () => {
      validateQueryObject(getManyByPlaylistShuffleQuerySchema, req, res, async () => {
        optionalEnsureAuthenticated(req, res, async () => {
          verifyPrivatePlaylistOwnershipIfNeeded()(req, res, async () => {
            const { playlist_id_text } = req.params;
            const { page, limit, offset } = getPaginationParams(req);
            const { shuffleHash } = req.query as { shuffleHash: string };
            const account_id = req.user?.id || null;

            try {
              const config: FindManyOptions<PlaylistResource> = {
                skip: offset,
                take: limit
              };
              const playlistResources = await PlaylistResourceController.playlistResourceService.getManyByPlaylistShuffle(
                playlist_id_text,
                shuffleHash,
                account_id,
                config
              );
              const totalCount = await PlaylistResourceController.playlistResourceService.getAllByPlaylistIdTextCount(playlist_id_text);

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
    });
  }

  static async getManyByPlaylistIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistIdSchema, req, res, async () => {
      optionalEnsureAuthenticated(req, res, async () => {
        verifyPrivatePlaylistOwnershipIfNeeded()(req, res, async () => {
          const { playlist_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);
          const account_id = req.user?.id || null;
          
          try {
            const playlistResources = await PlaylistResourceController
              .playlistResourceService.getManyByPlaylistIdText(
                playlist_id_text,
                account_id,
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
