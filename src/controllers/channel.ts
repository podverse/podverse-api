import { Request, Response } from 'express';
import Joi from 'joi';
import { getCategoryEnumValue, CATEGORY_MAPPING_KEYS, QUERY_PARAMS_STATS_RANGE_VALUES,
  ApiListResponse, CategoryMappingKeys, QueryParamsStatsRange, QueryParamsMedium,
  getMediumFromQueryParam, QUERY_PARAMS_MEDIUMS } from 'podverse-helpers';
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

const getManyGlobalRecentSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyGlobalTopSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyCategoryRecentSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  category: Joi.string().valid(...CATEGORY_MAPPING_KEYS).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyCategoryTopSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  category: Joi.string().valid(...CATEGORY_MAPPING_KEYS).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required(),
  page: Joi.number().integer().min(1).required()
});

const getManySubscribedAZSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required()
});

const getManySubscribedRecentSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required()
});

const getManySubscribedTopSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required(),
  page: Joi.number().integer().min(1).required()
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

  static async getManyGlobalRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyGlobalRecentSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { medium } = req.query as {
          medium: QueryParamsMedium;
        };
        const selectedMedium: QueryParamsMedium = medium;
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = null;

        const recentConfig: FindManyOptions<Channel> = {
          order: { channel_about: { last_pub_date: 'DESC' } },
          skip: offset,
          take: limit,
          relations: channelGetManyRelations
        };
        const channels = await ChannelController.channelService.getMany(
          recentConfig,
          medium_id,
          category_id
        );

        const response: ApiListResponse<Channel> = {
          data: channels.filter(Boolean),
          meta: { page, count: null, limit }
        };
        res.json(response);
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getManyGlobalTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyGlobalTopSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { range, medium } = req.query as {
          range: QueryParamsStatsRange;
          medium: QueryParamsMedium;
        };
        const selectedMedium: QueryParamsMedium = medium;
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = null;

        const orderField = getStatsOrder(range);
        const topConfig: FindManyOptions<StatsAggregatedChannel> = {
          order: { [orderField]: 'DESC' },
          skip: offset,
          take: limit,
          relations: subChannelGetManyRelations,
        };
        const statsResults = await ChannelController.statsAggregatedChannelService.getMany(
          topConfig,
          medium_id,
          category_id
        );
        const channels = statsResults.map((s: { channel: Channel }) => s.channel).filter(Boolean);

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

  static async getManyCategoryRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyCategoryRecentSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { category, medium } = req.query as {
          category: CategoryMappingKeys;
          medium: QueryParamsMedium;
        };
        const selectedMedium: QueryParamsMedium = medium;
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = getCategoryEnumValue(category);

        const recentConfig: FindManyOptions<Channel> = {
          order: { channel_about: { last_pub_date: 'DESC' } },
          skip: offset,
          take: limit,
          relations: channelGetManyRelations
        };
        const recentResults = await ChannelController.channelService.getMany(
          recentConfig,
          medium_id,
          category_id
        );
        const channels = recentResults.filter(Boolean);

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

  static async getManyCategoryTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyCategoryTopSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { category, range, medium } = req.query as {
          category: CategoryMappingKeys;
          range: QueryParamsStatsRange;
          medium: QueryParamsMedium;
        };
        const selectedMedium: QueryParamsMedium = medium;
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = getCategoryEnumValue(category);

        const orderField = getStatsOrder(range);;
        const topConfig: FindManyOptions<StatsAggregatedChannel> = {
          order: { [orderField]: 'DESC' },
          skip: offset,
          take: limit,
          relations: subChannelGetManyRelations
        };
        const statsResults = await ChannelController.statsAggregatedChannelService.getMany(
          topConfig,
          medium_id,
          category_id
        );
        const channels = statsResults.map((s: { channel: Channel }) => s.channel).filter(Boolean);

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

  static async getManySubscribedAZ(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySubscribedAZSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const { medium } = req.query as {
            medium: QueryParamsMedium;
          };
          const account_id = req.user!.id;
          const selectedMedium: QueryParamsMedium = medium;
          const medium_id = getMediumFromQueryParam(selectedMedium);

          const channelIds = await getFollowedChannelIds(account_id, medium_id);
          let channels: Channel[] = [];
          let count = channelIds.length;

          if (channelIds.length) {
            const accountFollowingChannelService = new AccountFollowingChannelService();
            const order: FindManyOptions<AccountFollowingChannel>['order'] = { channel: { sortable_title: 'ASC' } };
            const config: FindManyOptions<AccountFollowingChannel> = {
              skip: offset,
              take: limit,
              relations: subChannelGetManyRelations,
              order,
            };

            const { results: followedResults, count: followedCount } = await accountFollowingChannelService
              .getFollowedChannelsWithCount(Number(account_id), medium_id, config);
            count = followedCount ?? channelIds.length;
            channels = followedResults.map((f: { channel: Channel }) => f.channel).filter(Boolean);
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

  static async getManySubscribedRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySubscribedRecentSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const { medium } = req.query as {
            medium: QueryParamsMedium;
          };
          const account_id = req.user!.id;
          const selectedMedium: QueryParamsMedium = medium;
          const medium_id = getMediumFromQueryParam(selectedMedium);

          const channelIds = await getFollowedChannelIds(account_id, medium_id);
          let channels: Channel[] = [];
          let count = channelIds.length;

          if (channelIds.length) {
            const accountFollowingChannelService = new AccountFollowingChannelService();
            const order: FindManyOptions<AccountFollowingChannel>['order'] = { channel: { channel_about: { last_pub_date: 'DESC' } } };
            const config: FindManyOptions<AccountFollowingChannel> = {
              skip: offset,
              take: limit,
              relations: subChannelGetManyRelations,
              order,
            };

            const { results: followedResults, count: followedCount } = await accountFollowingChannelService
              .getFollowedChannelsWithCount(Number(account_id), medium_id, config);
            count = followedCount ?? channelIds.length;
            channels = followedResults.map((f: { channel: Channel }) => f.channel).filter(Boolean);
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

  static async getManySubscribedTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySubscribedTopSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const { range, medium } = req.query as {
            range: QueryParamsStatsRange;
            medium: QueryParamsMedium;
          };
          const account_id = req.user!.id;
          const selectedMedium: QueryParamsMedium = medium;
          const medium_id = getMediumFromQueryParam(selectedMedium);

          const channelIds = await getFollowedChannelIds(account_id, medium_id);
          let channels: Channel[] = [];
          let count = 0;

          if (channelIds.length) {
            const orderField = getStatsOrder(range);
            const config: FindManyOptions<StatsAggregatedChannel> = {
              order: { [orderField]: 'DESC' },
              skip: offset,
              take: limit,
              relations: subChannelGetManyRelations
            };
            const results = await ChannelController.statsAggregatedChannelService.getManyByChannelsAndCount(channelIds, config);
            const statsResults = results[0];
            channels = statsResults.map((s: { channel: Channel }) => s.channel).filter(Boolean);
            count = results[1];
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
