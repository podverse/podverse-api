import { Request, Response } from 'express';
import Joi from 'joi';
import { itemGetOneRelations, itemGetManyRelations, ItemChapterService, ItemService, Item,
  FindOptionsOrder, FindOptionsWhere, StatsAggregatedItem, FindManyOptions, subItemGetManyRelations,
  StatsAggregatedItemService, ChannelService } from 'podverse-orm';
import { parseChapters } from 'podverse-parser';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams, PaginatedData } from '@api/controllers/helpers/pagination';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { ApiListResponse, CATEGORY_MAPPING_KEYS, CategoryMappingKeys, getCategoryEnumValue,
  QUERY_PARAMS_CHANNEL_SORT_VALUES, QUERY_PARAMS_ITEMS_SORT_VALUES, QUERY_PARAMS_STATS_RANGE_VALUES,
  QueryParamsItemsSort, QueryParamsStatsRange } from 'podverse-helpers';
import { getStatsOrder } from '@api/lib/stats';
import { ensureAuthenticated } from '@api/lib/auth';
import { getFollowedChannelIds } from '@api/lib/followed';

interface SubscribedParams {
  account_id: number;
  sort?: QueryParamsItemsSort;
  range?: QueryParamsStatsRange;
  offset: number;
  limit: number;
  sendResponse: (data: PaginatedData<Item>) => void;
}

type ItemWhere = FindOptionsWhere<Item>;
type ItemOrder = FindOptionsOrder<Item>;

const getByIdOrIdTextSchema = Joi.object({
  idOrIdText: Joi.string().required()
});

const getManySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  type: Joi.string().valid("global", "category").optional(),
  sort: Joi.string().valid("top").optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional(),
  category: Joi.string().valid(...CATEGORY_MAPPING_KEYS).optional(),
  channel_ids: Joi.array().items(Joi.number()).optional()
});

const getManyByChannelParmsSchema = Joi.object({
  channelIdOrIdText: Joi.string().required()
});

const getManyByChannelQuerySchema = Joi.object({
  sort: Joi.string().valid(...QUERY_PARAMS_CHANNEL_SORT_VALUES).optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional(),
  page: Joi.number().integer().min(1).optional(),
});

const getManySubscribedSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  type: Joi.string().valid("subscribed").optional(),
  sort: Joi.string().valid(...QUERY_PARAMS_ITEMS_SORT_VALUES).optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional()
});

const parseAndGetChaptersSchema = Joi.object({
  item_id_text: Joi.string().required()
});

export class ItemController {
  private static itemService: ItemService = new ItemService();
  private static itemChapterService: ItemChapterService = new ItemChapterService();
  private static channelService: ChannelService = new ChannelService();
  private static statsAggregatedItemService: StatsAggregatedItemService = new StatsAggregatedItemService();

  static async getByIdOrIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByIdOrIdTextSchema, req, res, async () => {
      try {
        const { idOrIdText } = req.params;
        const data = await ItemController.itemService.getByIdOrIdText(idOrIdText, itemGetOneRelations);
        handleReturnDataOrNotFound(res, data, 'Item');
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
        const sendResponse = (data: PaginatedData<Item>) => {
          const response: ApiListResponse<Item> = {
            data: data.results,
            meta: { page, count: data.count, limit }
          };
          res.json(response);
        };
        
        const order = getStatsOrder(range);
        const where = ItemController.buildItemWhere(category);
        const config: FindManyOptions<StatsAggregatedItem> = {
          order: { [order]: 'DESC' },
          skip: offset,
          take: limit,
          relations: subItemGetManyRelations,
          ...(where ? { where } : {})
        };

        const statsResults = await ItemController.statsAggregatedItemService.getMany(config);

        const items = statsResults.map((stat: { item: Item }) => stat.item).filter(Boolean);
        sendResponse({ results: items, count: null });

      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getManyByChannel(req: Request, res: Response): Promise<void> {
    validateParamsObject(getManyByChannelParmsSchema, req, res, async () => {
      validateQueryObject(getManyByChannelQuerySchema, req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const { channelIdOrIdText } = req.params;
          const { sort, range } = req.query as {
            sort?: QueryParamsItemsSort;
            range?: QueryParamsStatsRange;
          };

          const channel = await ItemController.channelService.getByIdOrIdText(
            channelIdOrIdText,
            { channel_about: true }
          );

          let items: Item[] = [];
          if (sort === 'top') {
            const order = getStatsOrder(range);
            const config: FindManyOptions<StatsAggregatedItem> = {
              order: { [order]: 'DESC' },
              skip: offset,
              take: limit,
              relations: subItemGetManyRelations,
              where: { item: { channel: { id: channel.id} } }
            };
            const statsResults = await ItemController.statsAggregatedItemService.getMany(config);
            items = statsResults.map((stat: { item: Item }) => stat.item).filter(Boolean);
          } else {
            const order = ItemController.getOrder(sort);
            const config: FindManyOptions<Item> = {
              skip: offset,
              take: limit,
              relations: itemGetManyRelations,
              ...(order && { order })
            };
            items = await ItemController.itemService.getManyByChannel(channel, config);
          }

          res.json({ data: items, meta: { page, count: channel.channel_about.episode_count, limit } });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async getManySubscribed(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySubscribedSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const { sort, range } = req.query as {
            sort?: QueryParamsItemsSort;
            range?: QueryParamsStatsRange
          };
          const accountId = req.user!.id;
          const sendResponse = (data: PaginatedData<Item>) => {
            const response: ApiListResponse<Item> = {
              data: data.results,
              meta: { page, count: data.count, limit }
            };
            res.json(response);
          };
          await ItemController.handleSubscribed({ account_id: accountId, sort, range, offset, limit, sendResponse });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async parseAndGetChapters(req: Request, res: Response): Promise<void> {
    validateParamsObject(parseAndGetChaptersSchema, req, res, async () => {
      const { item_id_text } = req.params;
      try {
        const item = await ItemController
          .itemService.getByIdOrIdText(item_id_text, {
            relations: itemGetManyRelations
          });
        if (!item) {
          res.status(404).json({ message: 'Item not found' });
          return;
        }

        await parseChapters(item);

        const updatedItem = await ItemController
          .itemService.getByIdOrIdText(item_id_text, {
            relations: itemGetManyRelations
          });
        const chapters = await ItemController.itemChapterService.getAll(updatedItem.item_chapters_feed, {
          order: { start_time: 'ASC' }
        });

        res.json({ data: chapters });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  private static async handleSubscribed({ account_id, sort, range, offset, limit, sendResponse }: SubscribedParams) {
    const channel_ids = await getFollowedChannelIds(account_id);
    if (!channel_ids.length) return sendResponse({ results: [], count: 0 });
    if (sort === 'top') {
      const order = getStatsOrder(range);
      const config: FindManyOptions<StatsAggregatedItem> = {
        order: { [order]: 'DESC' },
        skip: offset,
        take: limit,
        relations: subItemGetManyRelations
      };
      const statsResults = await ItemController.statsAggregatedItemService.getManyByChannels(channel_ids, config);
      const items = statsResults.map((stat: { item: Item }) => stat.item).filter(Boolean);
      return sendResponse({ results: items, count: null });
    } else {
      const order = ItemController.getOrder(sort);
      const config: FindManyOptions<Item> = {
        skip: offset,
        take: limit,
        relations: subItemGetManyRelations,
        ...(order && { order }),
      };
      const items = await ItemController.itemService.getManyByChannels(channel_ids, config);
      return sendResponse({ results: items, count: null });
    }
  }

  private static getOrder(sort?: QueryParamsItemsSort): ItemOrder | undefined {
    switch (sort) {
    case 'recent':
      return { pub_date: 'DESC' };
    case 'oldest':
      return { pub_date: 'ASC' };
    default:
      return { pub_date: 'DESC' };
    }
  }

  private static buildItemWhere(category?: CategoryMappingKeys): ItemWhere | undefined {
    if (typeof category === 'string') {
      const category_id = getCategoryEnumValue(category);
      return { item: { channel: { channel_categories: { category_id } } } } as ItemWhere;
    }
    return undefined;
  }
}