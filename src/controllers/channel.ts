import { Request, Response } from 'express';
import Joi from 'joi';
import { getCategoryEnumValue, CATEGORY_MAPPING_KEYS, QUERY_PARAMS_CHANNELS_SORT_VALUES,
  QUERY_PARAMS_STATS_RANGE_VALUES, ApiListResponse, CategoryMappingKeys, QueryParamsStatsRange,
  QueryParamsChannelsSort} from 'podverse-helpers';
import { channelGetOneRelations, Channel, ChannelService, FindManyOptions, FindOptionsOrder, FindOptionsWhere,
  AccountFollowingChannelService, StatsAggregatedChannelService, AccountFollowingChannel,
  StatsAggregatedChannel, subChannelGetManyRelations} from 'podverse-orm';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams, PaginatedData } from '@api/controllers/helpers/pagination';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { ensureAuthenticated } from '@api/lib/auth';
import { getStatsOrder } from '@api/lib/stats';
import { getFollowedChannelIds } from '@api/lib/followed';

interface SubscribedParams {
  account_id: number;
  sort?: QueryParamsChannelsSort;
  range?: QueryParamsStatsRange;
  offset: number;
  limit: number;
  sendResponse: (data: PaginatedData<Channel>) => void;
}

interface TopSortParams {
  range?: QueryParamsStatsRange;
  category?: CategoryMappingKeys;
  offset: number;
  limit: number;
  sendResponse: (data: PaginatedData<Channel>) => void;
}

type TopSubscribedChannelsParams = {
  channel_ids: number[];
  range?: QueryParamsStatsRange;
  offset?: number;
  limit?: number;
};

type SortedSubscribedChannelsParams = {
  account_id: number;
  sort?: QueryParamsChannelsSort;
  offset?: number;
  limit?: number;
};

type ChannelWhere = FindOptionsWhere<Channel>;
type AccountFollowingChannelOrder = FindOptionsOrder<AccountFollowingChannel>;

const getByIdOrIdTextSchema = Joi.object({
  idOrIdText: Joi.string().required()
});

const getManySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  type: Joi.string().valid("global", "category").optional(),
  sort: Joi.string().valid("top").optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional(),
  category: Joi.string().valid(...CATEGORY_MAPPING_KEYS).optional()
});

const getManySubscribedSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  type: Joi.string().valid("subscribed").optional(),
  sort: Joi.string().valid(...QUERY_PARAMS_CHANNELS_SORT_VALUES).optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional()
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

  static async getMany(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { category, range } = req.query as { category?: CategoryMappingKeys; range?: QueryParamsStatsRange };
        const sendResponse = (data: PaginatedData<Channel>) => {
          const response: ApiListResponse<Channel> = {
            data: data.results,
            meta: { page, count: data.count, limit }
          };
          res.json(response);
        };
        await ChannelController.handleTopSort({ range, category, offset, limit, sendResponse });
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
          const { sort, range } = req.query as {
            sort?: QueryParamsChannelsSort;
            range?: QueryParamsStatsRange;
          };
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

  private static async handleTopSort({ range, category, offset, limit, sendResponse }: TopSortParams) {
    const order = getStatsOrder(range);
    const where = ChannelController.buildChannelWhere(category);
    const config: FindManyOptions<StatsAggregatedChannel> = {
      order: { [order]: 'DESC' },
      skip: offset,
      take: limit,
      relations: subChannelGetManyRelations,
      ...(where && { where }),
    };
    
    const statsResults = await ChannelController.statsAggregatedChannelService.getMany(config);
        
    const channels = statsResults.map((stat: { channel: Channel }) => stat.channel).filter(Boolean);
    sendResponse({ results: channels, count: null });
  }

  private static async handleSubscribed({ account_id, sort, range, offset, limit, sendResponse }: SubscribedParams) {
    const channel_ids = await getFollowedChannelIds(account_id);
    let channels: Channel[] = [];
    let count = channel_ids.length;
    
    if (channel_ids.length) {
      if (sort === 'top') {
        channels = await ChannelController._getTopSubscribedChannels({ channel_ids, range, offset, limit });
      } else {
        const { results: accountFollowingChannels, count: accountFollowingChannelsCount } = await ChannelController._getSortedSubscribedChannels({ account_id, sort, offset, limit });
        count = accountFollowingChannelsCount ?? channel_ids.length;
        channels = accountFollowingChannels.map((account_following_channel: { channel: Channel }) => account_following_channel.channel).filter(Boolean);
      }
    }
    
    sendResponse({ results: channels, count });
  }

  private static async _getTopSubscribedChannels({ channel_ids, range, offset, limit }: TopSubscribedChannelsParams): Promise<Channel[]> {
    const order = getStatsOrder(range);
    const config: FindManyOptions<StatsAggregatedChannel> = {
      order: { [order]: 'DESC' },
      skip: offset,
      take: limit,
      relations: subChannelGetManyRelations
    };
    const statsResults = await ChannelController.statsAggregatedChannelService.getManyByChannels(channel_ids, config);
    return statsResults.map((stat: { channel: Channel }) => stat.channel).filter(Boolean);
  }

  private static async _getSortedSubscribedChannels({ account_id, sort, offset, limit }: SortedSubscribedChannelsParams): Promise<{ count: number, results: AccountFollowingChannel[] }> {
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

  private static getSubscribedOrder(sort?: QueryParamsChannelsSort): AccountFollowingChannelOrder | undefined {
    switch (sort) {
    case 'recent':
      return { channel: { channel_about: { last_pub_date: 'DESC' } } };
    case 'oldest':
      return { channel: { channel_about: { last_pub_date: 'ASC' } } };
    case 'a_z':
      return { channel: { sortable_title: 'ASC' } };
    default:
      return undefined;
    }
  }

  private static buildChannelWhere(category?: CategoryMappingKeys): ChannelWhere | undefined {
    if (typeof category === 'string') {
      const category_id = getCategoryEnumValue(category);
      return { channel: { channel_categories: { category_id } } } as ChannelWhere;
    }
    return undefined;
  }
}
