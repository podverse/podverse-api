import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { MediumEnum, QUERY_PARAMS_STATS_RANGE_VALUES, QueryParamsPlaylistsSort, QueryParamsStatsRange, SharableStatusEnum } from 'podverse-helpers';
import { FindManyOptions, Playlist, PlaylistService, StatsAggregatedPlaylist, StatsAggregatedPlaylistService } from 'podverse-orm';
import { ensureAuthenticated, optionalEnsureAuthenticated } from '@api/lib/auth';
import { handleGenericErrorResponse } from '../helpers/error';
import { validateBodyObject, validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { getPaginationParams } from '../helpers/pagination';
import { getStatsOrder } from '@api/lib/stats';

type TopPublicPlaylistsParams = {
  range?: QueryParamsStatsRange;
  offset?: number;
  limit?: number;
  medium_id?: MediumEnum;
};

type TopSubscribedPlaylistsParams = {
  playlist_id_texts: string[];
  range?: QueryParamsStatsRange;
  offset?: number;
  limit?: number;
  medium_id?: MediumEnum;
};

const playlistSchema = Joi.object({
  title: Joi.string().allow(null, ''),
  description: Joi.string().allow(null, ''),
  medium_id: Joi.number().min(1).required(),
  sharable_status_id: Joi.number().min(1).required(),
  is_default_favorites: Joi.boolean().required()
});

const playlistIdSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

const getManyPrivateSchema = Joi.object({
  medium_id: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
});

const getManyPublicSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid("top").optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional(),
  medium_id: Joi.number().integer().min(1).optional()
});

const playlistService = new PlaylistService();

export const verifyPlaylistOwnership = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const account = req.user!;
    const { playlist_id_text } = req.params;

    try {
      const playlist = await playlistService.getByIdText(playlist_id_text, { relations: ['account'] });
      if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found' });
      }

      if (playlist.account.id !== account.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      handleGenericErrorResponse(res, err);
    }
  };
};

const verifyPrivatePlaylistOwnership = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const account = req.user;
    const { playlist_id_text } = req.params;

    try {
      const playlist = await playlistService.getByIdText(playlist_id_text, {
        relations: ['account', 'sharable_status'],
      });

      if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found' });
      }

      if (playlist.sharable_status.id === SharableStatusEnum.Private) {
        if (!account?.id || playlist.account.id !== account.id) {
          return res.status(404).json({ message: 'Playlist not found' });
        }
      }

      next();
    } catch (err) {
      handleGenericErrorResponse(res, err);
    }
  };
};

class PlaylistController {
  private static playlistService = new PlaylistService();
  private static statsAggregatedPlaylistService = new StatsAggregatedPlaylistService();

  static async createPlaylist(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(playlistSchema, req, res, async () => {
        const account = req.user!;

        const dto = {
          title: req.body.title,
          description: req.body.description,
          medium_id: req.body.medium,
          sharable_status_id: req.body.sharable_status,
          is_default_favorites: req.body.is_default_favorites
        };

        try {
          const playlist = await PlaylistController.playlistService.create(
            account.id,
            dto
          );
          res.status(201).json(playlist);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async updatePlaylist(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateParamsObject(playlistIdSchema, req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          validateBodyObject(playlistSchema, req, res, async () => {
            const account = req.user!;
            const { playlist_id_text } = req.params;
            const dto = {
              title: req.body.title,
              description: req.body.description,
              medium_id: req.body.medium,
              sharable_status_id: req.body.sharable_status,
              is_default_favorites: req.body.is_default_favorites
            };

            try {
              const playlist = await PlaylistController.playlistService.update(account.id, playlist_id_text, dto);
              res.status(200).json(playlist);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async deletePlaylist(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateParamsObject(playlistIdSchema, req, res, async () => {
        verifyPlaylistOwnership()(req, res, async () => {
          const account = req.user!;
          const { playlist_id_text } = req.params;

          try {
            await PlaylistController.playlistService.delete(account.id, playlist_id_text);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getManyPublic(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyPublicSchema, req, res, async () => {
      try {
        const { medium_id, range } = req.query as { medium_id?: MediumEnum; range?: QueryParamsStatsRange };
        const { page, limit, offset } = getPaginationParams(req);

        const playlists = await PlaylistController._getTopPublicPlaylists({
          range,
          offset,
          limit,
          medium_id
        });

        res.status(200).json({
          data: playlists,
          meta: { page }
        });
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getManyPrivate(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateQueryObject(getManyPrivateSchema, req, res, async () => {
        try {
          const account = req.user!;
          const { medium } = req.query;
          const { page, limit, offset } = getPaginationParams(req);

          const options = {
            where: {
              ...(medium && { medium: { id: medium } }),
              account: { id: account.id }
            },
            skip: offset,
            take: limit,
            relations: ['account', 'medium']
          };

          const playlists = await PlaylistController.playlistService.getMany(options);
          
          res.status(200).json({
            data: playlists,
            meta: { page }
          });
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getAllFavoritesPrivate(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const account = req.user!;
        const favorites = await PlaylistController.playlistService.getAllFavoritesPrivate(account.id);
        res.status(200).json(favorites);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getPlaylistById(req: Request, res: Response): Promise<void> {
    validateParamsObject(playlistIdSchema, req, res, async () => {
      optionalEnsureAuthenticated(req, res, async () => {
        verifyPrivatePlaylistOwnership()(req, res, async () => {
          try {
            const { playlist_id_text } = req.params;
            const playlist = await PlaylistController.playlistService.getByIdText(playlist_id_text);
            if (playlist) {
              res.status(200).json(playlist);
            } else {
              res.status(404).json({ message: 'Playlist not found' });
            }
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  private static async _getTopPublicPlaylists({ range, offset, limit, medium_id }: TopPublicPlaylistsParams): Promise<Playlist[]> {
    const order = getStatsOrder(range);
    const config: FindManyOptions<StatsAggregatedPlaylist> = {
      order: { [order]: 'DESC' },
      skip: offset,
      take: limit
    };

    const statsResults = await PlaylistController.statsAggregatedPlaylistService.getManyPublic(config, medium_id);
    return statsResults.map((stat: { playlist: Playlist }) => stat.playlist).filter(Boolean);
  }

  private static async _getTopSubscribedPlaylists({ playlist_id_texts, range, offset, limit }: TopSubscribedPlaylistsParams): Promise<Playlist[]> {
    const order = getStatsOrder(range);
    const config: FindManyOptions<StatsAggregatedPlaylist> = {
      order: { [order]: 'DESC' },
      skip: offset,
      take: limit
    };
    const statsResults = await PlaylistController.statsAggregatedPlaylistService.getManyByPlaylists(playlist_id_texts, config);
    return statsResults.map((stat: { playlist: Playlist }) => stat.playlist).filter(Boolean);
  }
}

export { PlaylistController };
