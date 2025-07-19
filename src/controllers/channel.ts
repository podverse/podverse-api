import { Request, Response } from 'express';
import Joi from 'joi';
import { channelGetManyRelations, channelGetOneRelations, Channel, ChannelService,
  FindManyOptions, FindOptionsOrder, FindOptionsWhere, AccountFollowingChannelService, 
  StatsAggregatedChannelService, AccountFollowingChannel, 
  StatsAggregatedChannel,
  subChannelGetManyRelations} from 'podverse-orm';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams, PaginatedData } from '@api/controllers/helpers/pagination';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { getCategoryEnumValue, CATEGORY_MAPPING_KEYS, QUERY_PARAMS_CHANNELS_SORT_VALUES,
  QUERY_PARAMS_STATS_RANGE_VALUES, ApiListResponse } from 'podverse-helpers';
import { ensureAuthenticated } from '@api/lib/auth';

interface SubscribedParams {
  account_id: number;
  sort?: string;
  range?: string;
  offset: number;
  limit: number;
  sendResponse: (data: PaginatedData<Channel>) => void;
}

interface TopSortParams {
  range?: string;
  offset: number;
  limit: number;
  sendResponse: (data: PaginatedData<Channel>) => void;
}

type ChannelWhere = FindOptionsWhere<Channel>;
type ChannelOrder = FindOptionsOrder<Channel>;
type AccountFollowingChannelOrder = FindOptionsOrder<AccountFollowingChannel>;

const getByIdOrIdTextSchema = Joi.object({
  idOrIdText: Joi.string().required()
});

const getManyAllSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid("top").optional(),
  type: Joi.string().valid("all").optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional()
});

const getManyCategorySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid("top").optional(),
  type: Joi.string().valid("category").optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional(),
  category: Joi.string().valid(...CATEGORY_MAPPING_KEYS).optional()
});

const getManySubscribedSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid(...QUERY_PARAMS_CHANNELS_SORT_VALUES).optional(),
  type: Joi.string().valid("subscribed").optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional()
});

export class ChannelController {
  private static channelService = new ChannelService();
  private static statsAggregatedChannelService = new StatsAggregatedChannelService();

  static async getByIdOrIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByIdOrIdTextSchema, req, res, async () => {
      try {
        const { idOrIdText } = req.params;
        const data = await ChannelController.channelService.getByIdOrIdText(idOrIdText, channelGetOneRelations);
        handleReturnDataOrNotFound(res, data, 'Channel');
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getManyAll(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyAllSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { range } = req.query as { range?: string };
        const sendResponse = (data: PaginatedData<Channel>) => {
          const response: ApiListResponse<Channel> = {
            data: data.results,
            meta: { page, count: data.count, limit }
          };
          res.json(response);
        };
        await ChannelController.handleTopSort({ range, offset, limit, sendResponse });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getManyCategory(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyCategorySchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { category, sort } = req.query as { category?: string; sort?: string };
        const order = ChannelController.getChannelOrder(sort);
        const where = ChannelController.buildChannelWhere(category as string);
        const channels = await ChannelController.channelService.getMany({
          skip: offset,
          take: limit,
          relations: channelGetManyRelations,
          ...(where && { where }),
          ...(order && { order }),
        });

        const sendResponse = (data: PaginatedData<Channel>) => {
          const response: ApiListResponse<Channel> = {
            data: data.results,
            meta: { page, count: data.count, limit }
          };
          res.json(response);
        };
        sendResponse({ results: channels, count: null });
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
          const { sort, range } = req.query as { sort?: string; range?: string };
          const account_id = req.user!.id;
          const sendResponse = (data: PaginatedData<Channel>) => {
            const response: ApiListResponse<Channel> = {
              data: data.results,
              meta: { page, count: data.count, limit }
            };
            res.json(response);
          };
          await ChannelController.handleSubscribed({ account_id, sort, range, offset, limit, sendResponse });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  // --- Helper Handlers ---

  private static async handleSubscribed({ account_id, sort, range, offset, limit, sendResponse }: SubscribedParams) {
    const channel_ids = await ChannelController._getFollowedChannelIds(account_id);
    if (!channel_ids.length) return sendResponse({ results: [], count: 0 });
    if (sort === 'top') {
      const channels = await ChannelController._getTopSubscribedChannels(channel_ids, range, offset, limit);
      return sendResponse({ results: channels, count: channel_ids.length });
    }
    const { results: accountFollowingChannels, count } = await ChannelController._getSortedSubscribedChannels(account_id, sort, offset, limit);
    const channels = accountFollowingChannels.map((account_following_channel: { channel: Channel }) => account_following_channel.channel).filter(Boolean);
    sendResponse({ results: channels, count });
  }

  private static async _getFollowedChannelIds(account_id: number): Promise<number[]> {
    const accountFollowingChannelService = new AccountFollowingChannelService();
    const { results } = await accountFollowingChannelService.getFollowedChannelsWithCount(Number(account_id));
    return results.map((f: { channel_id: number }) => f.channel_id);
  }

  private static async _getTopSubscribedChannels(channel_ids: number[], range?: string, offset?: number, limit?: number): Promise<Channel[]> {
    const order = ChannelController.getStatsOrder(range);
    const config: FindManyOptions<StatsAggregatedChannel> = {
      order: { [order]: 'DESC' },
      skip: offset,
      take: limit,
      relations: subChannelGetManyRelations
    };
    const statsResults = await ChannelController.statsAggregatedChannelService.getMany(channel_ids, config);
    return statsResults.map((stat: { channel: Channel }) => stat.channel).filter(Boolean);
  }

  private static async _getSortedSubscribedChannels(account_id: number, sort?: string, offset?: number, limit?: number): Promise<{ count: number, results: AccountFollowingChannel[]}> {
    const accountFollowingChannelService = new AccountFollowingChannelService();
    const order = ChannelController.getSubscribedOrder(sort);
    const config: FindManyOptions<AccountFollowingChannel> = {
      skip: offset,
      take: limit,
      relations: subChannelGetManyRelations,
      ...(order && { order }),
    };
    return await accountFollowingChannelService.getFollowedChannelsWithCount(Number(account_id), config);
  }

  private static async handleTopSort({ range, offset, limit, sendResponse }: TopSortParams) {
    const order = ChannelController.getStatsOrder(range);
    const config: FindManyOptions<StatsAggregatedChannel> = {
      order: { [order]: 'DESC' },
      skip: offset,
      take: limit,
      relations: subChannelGetManyRelations
    };

    const statsResults = await ChannelController.statsAggregatedChannelService.getMany([], config);
    const channels = statsResults.map((stat: { channel: Channel }) => stat.channel).filter(Boolean);
    sendResponse({ results: channels, count: null });
  }

  private static getStatsOrder(range?: string): string {
    switch (range) {
    case 'day':
      return 'day_current_count';
    case 'week':
      return 'week_current_count';
    case 'month':
      return 'month_current_count';
    case 'all-time':
      return 'all_time_count';
    default:
      return 'day_current_count';
    }
  }

  private static getSubscribedOrder(sort?: string): AccountFollowingChannelOrder | undefined {
    switch (sort) {
    case 'recent':
      return { channel: { channel_about: { last_pub_date: 'DESC' } } };
    case 'oldest':
      return { channel: { channel_about: { last_pub_date: 'ASC' } } };
    case 'alphabetical':
      return { channel: { sortable_title: 'ASC' } };
    default:
      return undefined;
    }
  }

  private static getChannelOrder(sort?: string): ChannelOrder | undefined {
    switch (sort) {
    case 'recent':
      return { channel_about: { last_pub_date: 'DESC' } };
    case 'oldest':
      return { channel_about: { last_pub_date: 'ASC' } };
    case 'alphabetical':
      return { sortable_title: 'ASC' };
    default:
      return undefined;
    }
  }

  private static buildChannelWhere(category?: string): ChannelWhere | undefined {
    if (typeof category === 'string') {
      const category_id = getCategoryEnumValue(category);
      return { channel_categories: { category_id } } as ChannelWhere;
    }
    return undefined;
  }
}
