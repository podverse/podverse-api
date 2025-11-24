import { Request, Response } from 'express';
import Joi from 'joi';
import { getCategoryEnumValue, CATEGORY_MAPPING_KEYS, QUERY_PARAMS_CHANNELS_SORT_VALUES,
  QUERY_PARAMS_STATS_RANGE_VALUES, ApiListResponse, CategoryMappingKeys, QueryParamsStatsRange,
  QueryParamsChannelsSort, QueryParamsMedium,
  getMediumFromQueryParam,
  QUERY_PARAMS_MEDIUMS} from 'podverse-helpers';
import { channelGetOneRelations, channelGetManyRelations, Channel, ChannelService, FindManyOptions,
  AccountFollowingChannelService, StatsAggregatedChannelService, AccountFollowingChannel,
  StatsAggregatedChannel, subChannelGetManyRelations} from 'podverse-orm';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams } from '@api/controllers/helpers/pagination';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { ensureAuthenticated } from '@api/lib/auth';
import { getStatsOrder } from '@api/lib/stats';
import { getFollowedChannelIds } from '@api/lib/followed';

const getByPodcastIndexIdSchema = Joi.object({
  podcast_index_id: Joi.string().required()
});

const getByIdOrIdTextSchema = Joi.object({
  idOrIdText: Joi.string().required()
});

const getManySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  type: Joi.string().valid("global", "category").optional(),
  sort: Joi.string().valid("top", "recent").optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional(),
  category: Joi.string().valid(...CATEGORY_MAPPING_KEYS).optional(),
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).optional()
});

const getManySubscribedSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  type: Joi.string().valid("subscribed").optional(),
  sort: Joi.string().valid(...QUERY_PARAMS_CHANNELS_SORT_VALUES).optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional(),
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).optional()
});

export class ChannelController {
  private static channelService = new ChannelService();
  private static statsAggregatedChannelService = new StatsAggregatedChannelService();

  static async getByIdOrIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByIdOrIdTextSchema, req, res, async () => {
      try {
        const data: Channel | null = await ChannelController.channelService.getByIdOrIdText(req.params.idOrIdText, channelGetOneRelations);
        handleReturnDataOrNotFound(res, data, 'Channel');
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getbyPodcastIndexId(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByPodcastIndexIdSchema, req, res, async () => {
      try {
        const podcastIndexId = parseInt(req.params.podcast_index_id, 10);
        if (isNaN(podcastIndexId)) {
          return res.status(400).json({ error: "Invalid podcast_index_id" });
        }
        const data: Channel | null = await ChannelController.channelService.getByPodcastIndexId(podcastIndexId, channelGetOneRelations);
        res.json(data || null);
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getMany(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { category, range, medium, sort } = req.query as {
          category?: CategoryMappingKeys;
          range?: QueryParamsStatsRange;
          medium?: QueryParamsMedium;
          sort?: 'top' | 'recent'
        };
        const selectedMedium: QueryParamsMedium = medium || 'all';
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = category ? getCategoryEnumValue(category) : null;

        let channels: Channel[] = [];

        if (sort === 'recent') {
          const channelWhere = category_id !== null ? { channel_categories: { category_id } } : undefined;
          const recentConfig: FindManyOptions<Channel> = {
            order: { channel_about: { last_pub_date: 'DESC' } },
            skip: offset,
            take: limit,
            relations: channelGetManyRelations
          };
          const recentResults = await ChannelController.channelService.getMany(recentConfig, medium_id, channelWhere);
          channels = recentResults.filter(Boolean);
        } else {
          const orderField = getStatsOrder(range);
          let statsWhere: { channel: { channel_categories: { category_id: number } } } | undefined;
          if (category_id !== null) {
            statsWhere = { channel: { channel_categories: { category_id } } };
          }
          const topConfig: FindManyOptions<StatsAggregatedChannel> = {
            order: { [orderField]: 'DESC' },
            skip: offset,
            take: limit,
            relations: subChannelGetManyRelations,
            ...(statsWhere && { where: statsWhere }),
          };
          const statsResults = await ChannelController.statsAggregatedChannelService.getMany(topConfig, medium_id);
          channels = statsResults.map((s: { channel: Channel }) => s.channel).filter(Boolean);
        }

        const response: ApiListResponse<Channel> = {
          data: channels,
          meta: { page, count: null, limit }
        };
        res.json(response);
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getManySubscribed(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySubscribedSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const { sort, range, medium } = req.query as {
            sort?: QueryParamsChannelsSort;
            range?: QueryParamsStatsRange;
            medium?: QueryParamsMedium;
          };
          const account_id = req.user!.id;
          const selectedMedium: QueryParamsMedium = medium || 'all';
          const medium_id = getMediumFromQueryParam(selectedMedium);

          const channelIds = await getFollowedChannelIds(account_id);
          let channels: Channel[] = [];
          let count = channelIds.length;
          
          if (channelIds.length) {
            if (sort === 'top') {
              const orderField = getStatsOrder(range);
              const config: FindManyOptions<StatsAggregatedChannel> = {
                order: { [orderField]: 'DESC' },
                skip: offset,
                take: limit,
                relations: subChannelGetManyRelations
              };
              const statsResults = await ChannelController.statsAggregatedChannelService.getManyByChannels(channelIds, medium_id, config);
              channels = statsResults.map((s: { channel: Channel }) => s.channel).filter(Boolean);
            } else {
              const accountFollowingChannelService = new AccountFollowingChannelService();
              let order: FindManyOptions<AccountFollowingChannel>['order'];
              switch (sort) {
              case 'recent':
                order = { channel: { channel_about: { last_pub_date: 'DESC' } } };
                break;
              case 'oldest':
                order = { channel: { channel_about: { last_pub_date: 'ASC' } } };
                break;
              case 'a_z':
                order = { channel: { sortable_title: 'ASC' } };
                break;
              default:
                order = undefined;
              }

              const config: FindManyOptions<AccountFollowingChannel> = {
                skip: offset,
                take: limit,
                relations: subChannelGetManyRelations,
                ...(order && { order }),
              };

              const { results: followedResults, count: followedCount } = await accountFollowingChannelService
                .getFollowedChannelsWithCount(Number(account_id), medium_id, config);
              count = followedCount ?? channelIds.length;
              channels = followedResults.map((f: { channel: Channel }) => f.channel).filter(Boolean);
            }
          }
          
          const response: ApiListResponse<Channel> = {
            data: channels,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }
}
