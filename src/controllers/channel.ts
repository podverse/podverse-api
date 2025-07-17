import { Request, Response } from 'express';
import Joi from 'joi';
import { channelGetManyRelations, channelGetOneRelations, subChannelGetManyRelations, Channel, ChannelService,
  FindManyOptions, FindOptionsOrder, FindOptionsWhere, AccountFollowingChannelService, 
  StatsAggregatedChannelService, AccountFollowingChannel } from 'podverse-orm';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams } from '@api/controllers/helpers/pagination';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { getCategoryEnumValue, categoryMappingKeys, QUERY_PARAM_CHANNEL_SORT_VALUES,
  QUERY_PARAM_CHANNEL_TYPE_VALUES, QUERY_PARAM_CHANNEL_RANGE_VALUES } from 'podverse-helpers';

const getByIdOrIdTextSchema = Joi.object({
  idOrIdText: Joi.string().required()
});

const getManySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid(...QUERY_PARAM_CHANNEL_SORT_VALUES).optional(),
  type: Joi.string().valid(...QUERY_PARAM_CHANNEL_TYPE_VALUES).optional(),
  range: Joi.string().valid(...QUERY_PARAM_CHANNEL_RANGE_VALUES).optional(),
  category: Joi.string().valid(...categoryMappingKeys).optional(),
  account_id: Joi.string().optional()
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

  static async getMany(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { type = 'all', category, sort, range, account_id } = req.query as {
          type?: string;
          category?: string;
          sort?: string;
          range?: string;
          account_id?: string;
        };

        const sendResponse = (channels: Channel[]) => {
          res.json({
            data: channels,
            meta: { page }
          });
        };

        if (type === 'subscribed') {
          await ChannelController.handleSubscribed({ account_id, sort, range, offset, limit, sendResponse });
        } else if (sort === 'top') {
          await ChannelController.handleTopSort({ range, offset, limit, sendResponse });
        } else {
          const order = ChannelController.getChannelOrder(sort);
          const where = type === 'category' ? ChannelController.buildChannelWhere(category as string) : undefined;
          const channels = await ChannelController.channelService.getMany({
            skip: offset,
            take: limit,
            relations: channelGetManyRelations,
            ...(where && { where }),
            ...(order && { order }),
          });
          sendResponse(channels);
        }
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  // --- Helper Handlers ---

  private static async handleSubscribed({ account_id, sort, range, offset, limit, sendResponse }: SubscribedParams) {
    if (!account_id) {
      sendResponse([]);
      return;
    }
    const accountFollowingChannelService = new AccountFollowingChannelService();
    const followed = await accountFollowingChannelService.getFollowedChannels(Number(account_id));
    const channel_ids = followed.map((f: { channel_id: number }) => f.channel_id);
    if (!channel_ids.length) {
      sendResponse([]);
      return;
    }

    if (sort === 'top') {
      const orderBy = ChannelController.getStatsOrderBy(range);
      const config = {
        order: { [orderBy]: 'DESC' },
        skip: offset,
        take: limit,
        relations: ['channel']
      };
      console.log(config);
      const statsResults = await ChannelController.statsAggregatedChannelService.getMany(channel_ids, config);
      const channels = statsResults.map((stat: { channel: Channel }) => stat.channel).filter(Boolean);
      sendResponse(channels);
      return;
    }

    const order = ChannelController.getSubscribedOrder(sort);
    const config: FindManyOptions<AccountFollowingChannel> = {
      skip: offset,
      take: limit,
      relations: ['channel'],
      ...(order && { order }),
    };
    const resultChannels = await accountFollowingChannelService.getFollowedChannels(Number(account_id), config);
    sendResponse(resultChannels);
  }

  private static async handleTopSort({ range, offset, limit, sendResponse }: TopSortParams) {
    const orderBy = ChannelController.getStatsOrderBy(range);
    const config = {
      order: { [orderBy]: 'DESC' },
      skip: offset,
      take: limit,
      relations: ['channel'],
    };

    console.log(config);
    const statsResults = await ChannelController.statsAggregatedChannelService.getMany([], config);
    const channels = statsResults.map((stat: { channel: Channel }) => stat.channel).filter(Boolean);
    sendResponse(channels);
  }

  private static getStatsOrderBy(range?: string): string {
    switch (range) {
    case 'week':
      return 'week_current_count';
    case 'month':
      return 'month_current_count';
    case 'all_time':
      return 'all_time_count';
    case 'day':
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
      return { channel: { title: 'ASC' } };
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
      return { title: 'ASC' };
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

// --- Types ---

interface SubscribedParams {
  account_id?: string;
  sort?: string;
  range?: string;
  offset: number;
  limit: number;
  sendResponse: (channels: Channel[]) => void;
}

interface TopSortParams {
  range?: string;
  offset: number;
  limit: number;
  sendResponse: (channels: Channel[]) => void;
}

type ChannelWhere = FindOptionsWhere<Channel>;
type ChannelOrder = FindOptionsOrder<Channel>;
type AccountFollowingChannelOrder = FindOptionsOrder<AccountFollowingChannel>;
