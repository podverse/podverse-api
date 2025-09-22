import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { ApiListResponse, DTOPlaylist, MediumEnum, QUERY_PARAMS_PLAYLISTS_SORT_VALUES, QUERY_PARAMS_STATS_RANGE_VALUES, QueryParamsPlaylistsSort, QueryParamsStatsRange, SharableStatusEnum } from 'podverse-helpers';
import { AccountFollowingPlaylist, AccountFollowingPlaylistService, FindManyOptions, FindOptionsOrder, Playlist, PlaylistService, StatsAggregatedPlaylist, StatsAggregatedPlaylistService } from 'podverse-orm';
import { ensureAuthenticated, optionalEnsureAuthenticated } from '@api/lib/auth';
import { handleGenericErrorResponse } from '../helpers/error';
import { validateBodyObject, validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { getPaginationParams, PaginatedData } from '../helpers/pagination';
import { getStatsOrder } from '@api/lib/stats';
import { getFollowedPlaylistIdsPrivate } from '@api/lib/followed';

type TopPublicPlaylistsParams = {
  range?: QueryParamsStatsRange;
  offset?: number;
  limit?: number;
  medium_id?: MediumEnum;
};

type TopPrivatePlaylistsParams = TopPublicPlaylistsParams & { account_id: number }

interface FollowedParams {
  account_id: number;
  medium_id?: MediumEnum;
  sort?: QueryParamsPlaylistsSort;
  range?: QueryParamsStatsRange;
  offset: number;
  limit: number;
  sendResponse: (data: PaginatedData<Playlist>) => void;
}

const createPlaylistSchema = Joi.object({
  title: Joi.string().allow(null, ''),
  description: Joi.string().allow(null, ''),
  medium_id: Joi.number().min(1).required(),
  sharable_status_id: Joi.number().min(1).required(),
  is_default_favorites: Joi.boolean().required()
});

const updatePlaylistSchema = createPlaylistSchema;

const playlistIdSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

const getManyPublicSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid("top").optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional(),
  medium_id: Joi.number().integer().min(1).optional()
});

const getManyPrivateSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid(...QUERY_PARAMS_PLAYLISTS_SORT_VALUES).optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional(),
  medium_id: Joi.number().integer().min(1).optional(),
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
      validateBodyObject(createPlaylistSchema, req, res, async () => {
        const account = req.user!;

        const dto = {
          title: req.body.title,
          description: req.body.description,
          medium_id: req.body.medium_id,
          sharable_status_id: req.body.sharable_status_id,
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
          validateBodyObject(updatePlaylistSchema, req, res, async () => {
            const account = req.user!;
            const { playlist_id_text } = req.params;
            const dto = {
              title: req.body.title,
              description: req.body.description,
              medium_id: req.body.medium_id,
              sharable_status_id: req.body.sharable_status_id,
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
          const { medium_id, sort, range } = req.query as { medium_id?: MediumEnum; sort?: QueryParamsPlaylistsSort; range?: QueryParamsStatsRange };
          const { page, limit, offset } = getPaginationParams(req);


          let results: [Playlist[], number] = [[], 0];

          if (sort === "top") {
            results = await PlaylistController._getTopPrivatePlaylists({
              range,
              offset,
              limit,
              medium_id,
              account_id: account.id
            });
          } else {
            results = await PlaylistController._getPrivatePlaylists({
              sort,
              offset,
              limit,
              medium_id,
              account_id: account.id
            });
          }

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

  static async getManyFollowedPrivate(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateQueryObject(getManyPrivateSchema, req, res, async () => {
        const { page, limit, offset } = getPaginationParams(req);
        const { sort, range, medium_id } = req.query as {
          sort?: QueryParamsPlaylistsSort;
          range?: QueryParamsStatsRange;
          medium_id?: MediumEnum;
        };
        const account_id = req.user!.id;

        const sendResponse = (data: PaginatedData<Playlist>) => {
          const response: ApiListResponse<Playlist> = {
            data: data.results,
            meta: { page, count: data.count, limit }
          };
          res.json(response);
        };

        await PlaylistController.handleFollowedPrivate({ account_id, medium_id, sort, range, offset, limit, sendResponse });
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
        verifyPrivatePlaylistOwnership()(req, res, async () => {
          try {
            const { playlist_id_text } = req.params;
            const account = req.user!;

            let playlist: DTOPlaylist | null = null;

            if (account) {
              playlist = await PlaylistController.playlistService.getOnePrivate(account.id_text, playlist_id_text);
            } else {
              playlist = await PlaylistController.playlistService.getOnePublic(playlist_id_text);
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

  private static async _getTopPrivatePlaylists({ range, offset, limit, medium_id, account_id }: TopPrivatePlaylistsParams): Promise<[Playlist[], number]> {
    const order = getStatsOrder(range);
    const config: FindManyOptions<StatsAggregatedPlaylist> = {
      order: { [order]: 'DESC' },
      skip: offset,
      take: limit
    };

    const statsResults = await PlaylistController.statsAggregatedPlaylistService.getManyPrivate(config, account_id, medium_id);
    const data = statsResults[0].map((stat: { playlist: Playlist }) => stat.playlist).filter(Boolean);
    const count = statsResults[1];
    
    return [data, count];
  }

  private static async _getPrivatePlaylists({ sort, offset, limit, medium_id, account_id }: {
    sort?: QueryParamsPlaylistsSort;
    offset?: number;
    limit?: number;
    medium_id?:
    MediumEnum;
    account_id: number;
  }): Promise<[Playlist[], number]> {
    const config: FindManyOptions<Playlist> = {
      skip: offset,
      take: limit,
      ...(medium_id ? { where: { medium_id } } : {})
    };

    if (sort === "recent") {
      config.order = { last_updated: 'DESC' };
    } else if (sort === "oldest") {
      config.order = { last_updated: 'ASC' };
    } else {
      config.order = { title: 'ASC' };
    }

    return PlaylistController.playlistService.getManyPrivate(account_id, config);
  }

  private static async handleFollowedPrivate({ account_id, medium_id, sort, range, offset, limit, sendResponse }: FollowedParams) {
    let playlists: Playlist[] = [];
    let count = 0;
    
    if (sort === 'top') {
      const playlist_ids = await getFollowedPlaylistIdsPrivate(account_id, medium_id);
      const order = getStatsOrder(range);
      const config: FindManyOptions<StatsAggregatedPlaylist> = {
        order: { [order]: 'DESC' },
        skip: offset,
        take: limit,
        relations: ['playlist', 'playlist.account', 'playlist.account.account_profile']
      };
      const statsResults = await PlaylistController.statsAggregatedPlaylistService.getManyPrivateByPlaylists(
        playlist_ids,
        config
      );

      playlists = statsResults[0].map((stat: { playlist: Playlist }) => stat.playlist).filter(Boolean);
      count = statsResults[1];
    } else {
      const accountFollowingPlaylistService = new AccountFollowingPlaylistService();
      const order = PlaylistController.getFollowedOrder(sort);
      const config: FindManyOptions<AccountFollowingPlaylist> = {
        skip: offset,
        take: limit,
        relations: ['playlist', 'playlist.account', 'playlist.account.account_profile'],
        ...(order && { order }),
      };
      const results = await accountFollowingPlaylistService.getFollowedPlaylistsPrivateWithCount(account_id, medium_id, config);
      playlists = results[0].map((account_following_playlist: { playlist: Playlist }) => account_following_playlist.playlist).filter(Boolean);
      count = results[1];
    }
    
    sendResponse({ results: playlists, count });
  }

  private static getFollowedOrder(
    sort?: QueryParamsPlaylistsSort)
    : FindOptionsOrder<AccountFollowingPlaylist> | undefined {
    switch (sort) {
    case 'recent':
      return { playlist: { last_updated: 'DESC' } };
    case 'oldest':
      return { playlist: { last_updated: 'ASC' } };
    case 'a_z':
      return { playlist: { title: 'ASC' } };
    default:
      return undefined;
    }
  }

}

export { PlaylistController };
