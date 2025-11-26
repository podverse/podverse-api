import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { ApiListResponse, getMediumFromQueryParam, QUERY_PARAMS_MEDIUMS,
  QUERY_PARAMS_STATS_RANGE_VALUES, QUERY_PARAMS_SUBSCRIBED_FULL_SORT,
  QueryParamsMedium, QueryParamsStatsRange,
  SharableStatusEnum } from 'podverse-helpers';
import { AccountFollowingPlaylist, AccountFollowingPlaylistService, FindManyOptions, Playlist,
  PlaylistService, StatsAggregatedPlaylist, StatsAggregatedPlaylistService } from 'podverse-orm';
import { ensureAuthenticated, optionalEnsureAuthenticated } from '@api/lib/auth';
import { handleGenericErrorResponse } from '../helpers/error';
import { validateBodyObject, validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { getPaginationParams } from '../helpers/pagination';
import { getStatsOrder } from '@api/lib/stats';
import { getFollowedPlaylistIdsPrivate } from '@api/lib/followed';

const createPlaylistSchema = Joi.object({
  title: Joi.string().allow(null, ''),
  description: Joi.string().allow(null, ''),
  medium_id: Joi.number().min(1).required(),
  sharable_status_id: Joi.number().min(1).required()
});

const updatePlaylistSchema = createPlaylistSchema;

const playlistIdSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

const getManyPublicTopSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyPrivateRecentSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyPrivateOldestSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyPrivateAZSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyPrivateTopSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required()
});

const getManyPrivateFollowedTopSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required()
});

const getManyPrivateFollowedRecentSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyPrivateFollowedOldestSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyPrivateFollowedAZSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required()
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

export const verifyPrivatePlaylistOwnershipIfNeeded = () => {
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
      validateBodyObject(createPlaylistSchema, req, res, async () => {
        const account = req.user!;

        const dto = {
          title: req.body.title,
          description: req.body.description,
          medium_id: req.body.medium_id,
          sharable_status_id: req.body.sharable_status_id
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
          validateBodyObject(updatePlaylistSchema, req, res, async () => {
            const account = req.user!;
            const { playlist_id_text } = req.params;
            const dto = {
              title: req.body.title,
              description: req.body.description,
              medium_id: req.body.medium_id,
              sharable_status_id: req.body.sharable_status_id
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

  static async getManyPublicTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyPublicTopSchema, req, res, async () => {
      try {
        const { medium, range } = req.query as {
          medium: QueryParamsMedium;
          range: QueryParamsStatsRange
        };
        const { page, limit, offset } = getPaginationParams(req);
        const medium_id = getMediumFromQueryParam(medium);
        
        const order = getStatsOrder(range);
        const config: FindManyOptions<StatsAggregatedPlaylist> = {
          order: { [order]: 'DESC' },
          skip: offset,
          take: limit
        };

        const statsResults = await PlaylistController
          .statsAggregatedPlaylistService.getManyPublic(config, medium_id);
        const playlists = statsResults
          .map((stat: { playlist: Playlist }) => stat.playlist).filter(Boolean);

        res.status(200).json({
          data: playlists,
          meta: { page }
        });
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getManyPrivateTop(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateQueryObject(getManyPrivateTopSchema, req, res, async () => {
        try {
          const account = req.user!;

          const { medium, range } = req.query as {
            medium: QueryParamsMedium;
            range: QueryParamsStatsRange;
          };

          const { page, limit, offset } = getPaginationParams(req);

          const order = getStatsOrder(range);
          const config: FindManyOptions<StatsAggregatedPlaylist> = {
            order: { [order]: 'DESC' },
            skip: offset,
            take: limit
          };

          const statsResults = await PlaylistController.statsAggregatedPlaylistService.getManyPrivate(
            config,
            account.id,
            getMediumFromQueryParam(medium)
          );
          const data = statsResults[0].map((stat: { playlist: Playlist }) => stat.playlist).filter(Boolean);
          const count = statsResults[1];

          const response: ApiListResponse<Playlist> = {
            data: data,
            meta: { page, count, limit }
          };

          res.status(200).json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyPrivateRecent(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateQueryObject(getManyPrivateRecentSchema, req, res, async () => {
        try {
          const account = req.user!;
          const { medium } = req.query as {
            medium: QueryParamsMedium;
          };
          const { page, limit, offset } = getPaginationParams(req);
          const medium_id = getMediumFromQueryParam(medium);

          const config: FindManyOptions<Playlist> = {
            skip: offset,
            take: limit,
            order: { last_updated: 'DESC' }
          };

          const results = await PlaylistController.playlistService.getManyPrivate(
            account.id,
            medium_id,
            config
          );

          const response: ApiListResponse<Playlist> = {
            data: results[0],
            meta: { page, count: results[1], limit }
          };

          res.status(200).json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyPrivateOldest(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateQueryObject(getManyPrivateOldestSchema, req, res, async () => {
        try {
          const account = req.user!;
          const { medium } = req.query as {
            medium: QueryParamsMedium;
          };
          const { page, limit, offset } = getPaginationParams(req);
          const medium_id = getMediumFromQueryParam(medium);

          const config: FindManyOptions<Playlist> = {
            skip: offset,
            take: limit,
            order: { last_updated: 'ASC' }
          };

          const results = await PlaylistController.playlistService.getManyPrivate(
            account.id,
            medium_id,
            config
          );

          const response: ApiListResponse<Playlist> = {
            data: results[0],
            meta: { page, count: results[1], limit }
          };

          res.status(200).json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyPrivateAZ(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateQueryObject(getManyPrivateAZSchema, req, res, async () => {
        try {
          const account = req.user!;
          const { medium } = req.query as {
            medium: QueryParamsMedium;
          };
          const { page, limit, offset } = getPaginationParams(req);
          const medium_id = getMediumFromQueryParam(medium);

          const config: FindManyOptions<Playlist> = {
            skip: offset,
            take: limit,
            order: { title: 'ASC' }
          };

          const results = await PlaylistController.playlistService.getManyPrivate(
            account.id,
            medium_id,
            config
          );

          const response: ApiListResponse<Playlist> = {
            data: results[0],
            meta: { page, count: results[1], limit }
          };

          res.status(200).json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyFollowedPrivateTop(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateQueryObject(getManyPrivateFollowedTopSchema, req, res, async () => {
        const { page, limit, offset } = getPaginationParams(req);
        const { range, medium } = req.query as {
          range: QueryParamsStatsRange;
          medium: QueryParamsMedium;
        };
        const account_id = req.user!.id;
        const medium_id = getMediumFromQueryParam(medium);

        const playlist_ids = await getFollowedPlaylistIdsPrivate(
          account_id,
          medium_id
        );
        const order = getStatsOrder(range);
        const config: FindManyOptions<StatsAggregatedPlaylist> = {
          order: { [order]: 'DESC' },
          skip: offset,
          take: limit,
          relations: ['playlist', 'playlist.account', 'playlist.account.account_profile']
        };
        const statsResults = await PlaylistController
          .statsAggregatedPlaylistService
          .getManyPrivateByPlaylists(
            playlist_ids,
            config
          );

        const playlists = statsResults[0].map((stat: { playlist: Playlist }) => stat.playlist).filter(Boolean);
        const count = statsResults[1];

        const response: ApiListResponse<Playlist> = {
          data: playlists,
          meta: { page, count, limit }
        };
        res.json(response);
      });
    });
  };

  static async getManyFollowedPrivateRecent(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateQueryObject(getManyPrivateFollowedRecentSchema, req, res, async () => {
        const { page, limit, offset } = getPaginationParams(req);
        const { medium } = req.query as {
          medium: QueryParamsMedium;
        };
        const account_id = req.user!.id;
        const medium_id = getMediumFromQueryParam(medium);

        const accountFollowingPlaylistService = new AccountFollowingPlaylistService();
        const config: FindManyOptions<AccountFollowingPlaylist> = {
          skip: offset,
          take: limit,
          relations: ['playlist', 'playlist.account', 'playlist.account.account_profile'],
          order: { playlist: { last_updated: 'DESC' } }
        };
        const results = await accountFollowingPlaylistService.getFollowedPlaylistsPrivateWithCount(account_id, medium_id, config);
        const playlists = results[0].map((account_following_playlist: { playlist: Playlist }) => account_following_playlist.playlist).filter(Boolean);
        const count = results[1];

        const response: ApiListResponse<Playlist> = {
          data: playlists,
          meta: { page, count, limit }
        };
        res.json(response);
      });
    });
  };

  static async getManyFollowedPrivateOldest(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateQueryObject(getManyPrivateFollowedOldestSchema, req, res, async () => {
        const { page, limit, offset } = getPaginationParams(req);
        const { medium } = req.query as {
          medium: QueryParamsMedium;
        };
        const account_id = req.user!.id;
        const medium_id = getMediumFromQueryParam(medium);

        const accountFollowingPlaylistService = new AccountFollowingPlaylistService();
        const config: FindManyOptions<AccountFollowingPlaylist> = {
          skip: offset,
          take: limit,
          relations: ['playlist', 'playlist.account', 'playlist.account.account_profile'],
          order: { playlist: { last_updated: 'ASC' } }
        };
        const results = await accountFollowingPlaylistService.getFollowedPlaylistsPrivateWithCount(account_id, medium_id, config);
        const playlists = results[0].map((account_following_playlist: { playlist: Playlist }) => account_following_playlist.playlist).filter(Boolean);
        const count = results[1];

        const response: ApiListResponse<Playlist> = {
          data: playlists,
          meta: { page, count, limit }
        };
        res.json(response);
      });
    });
  };

  static async getManyFollowedPrivateAZ(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateQueryObject(getManyPrivateFollowedAZSchema, req, res, async () => {
        const { page, limit, offset } = getPaginationParams(req);
        const { medium } = req.query as {
          medium: QueryParamsMedium;
        };
        const account_id = req.user!.id;
        const medium_id = getMediumFromQueryParam(medium);

        const accountFollowingPlaylistService = new AccountFollowingPlaylistService();
        const config: FindManyOptions<AccountFollowingPlaylist> = {
          skip: offset,
          take: limit,
          relations: ['playlist', 'playlist.account', 'playlist.account.account_profile'],
          order: { playlist: { title: 'ASC' } }
        };
        const results = await accountFollowingPlaylistService.getFollowedPlaylistsPrivateWithCount(account_id, medium_id, config);
        const playlists = results[0].map((account_following_playlist: { playlist: Playlist }) => account_following_playlist.playlist).filter(Boolean);
        const count = results[1];

        const response: ApiListResponse<Playlist> = {
          data: playlists,
          meta: { page, count, limit }
        };
        res.json(response);
      });
    });
  };

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
        verifyPrivatePlaylistOwnershipIfNeeded()(req, res, async () => {
          try {
            const { playlist_id_text } = req.params;
            const account = req.user!;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let playlist: any | null = null;

            if (account) {
              playlist = await PlaylistController.playlistService.getOnePrivate(account.id_text, playlist_id_text);
            } else {
              playlist = await PlaylistController.playlistService.getOnePublic(playlist_id_text);
            }

            if (playlist?.account?.id) {
              delete playlist.account.id;
            }
            
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

}

export { PlaylistController };
