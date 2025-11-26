import { Request, Response } from 'express';
import Joi from 'joi';
import { itemGetOneRelations, itemGetManyRelations, ItemChapterService, ItemService, Item,
  StatsAggregatedItem, FindManyOptions, subItemGetManyRelations,
  StatsAggregatedItemService, ChannelService, 
  itemGetManyRelationsWithChannel} from 'podverse-orm';
import { parseChapters } from 'podverse-parser';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams } from '@api/controllers/helpers/pagination';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { ApiListResponse, CATEGORY_MAPPING_KEYS, CategoryMappingKeys, emptyApiListResponse, getCategoryEnumValue,
  getMediumFromQueryParam,
  QUERY_PARAMS_DIRECTION_VALUES,
  QUERY_PARAMS_MEDIUMS,
  QUERY_PARAMS_STATS_RANGE_VALUES,
  QueryParamsDirection,
  QueryParamsMedium, QueryParamsStatsRange } from 'podverse-helpers';
import { getStatsOrder } from '@api/lib/stats';
import { ensureAuthenticated } from '@api/lib/auth';
import { getFollowedChannelIds } from '@api/lib/followed';

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

const getManySubscribedRecentSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  page: Joi.number().integer().min(1).required()
});

const getManySubscribedTopSchema = Joi.object({
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyByChannelParmsSchema = Joi.object({
  channelIdOrIdText: Joi.string().required()
});

const getManyByChannelQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).required()
});

const getManyByChannelTopQuerySchema = Joi.object({
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required(),
  page: Joi.number().integer().min(1).required()
});

const getManyForQueueByPubDateParamsSchema = Joi.object({
  idText: Joi.string().required()
});

const getManyForQueueByPubDateQuerySchema = Joi.object({
  direction: Joi.string().valid(...QUERY_PARAMS_DIRECTION_VALUES).required()
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

        const recentConfig: FindManyOptions<Item> = {
          order: { pub_date: 'DESC' },
          skip: offset,
          take: limit,
          relations: itemGetManyRelationsWithChannel
        };
        const items = await ItemController.itemService.getMany(
          recentConfig,
          medium_id,
          category_id,
          "normal"
        );

        const response: ApiListResponse<Item> = {
          data: items.filter(Boolean),
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
        const selectedMedium: QueryParamsMedium = medium || 'all';
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = null;
        
        const order = getStatsOrder(range);
        const config: FindManyOptions<StatsAggregatedItem> = {
          order: { [order]: 'DESC' },
          skip: offset,
          take: limit,
          relations: itemGetManyRelationsWithChannel
        };

        const statsResults = await ItemController.statsAggregatedItemService.getMany(
          config,
          medium_id,
          category_id,
          "normal"
        );

        const items = statsResults.map((stat: { item: Item }) => stat.item).filter(Boolean);
        const response: ApiListResponse<Item> = {
          data: items,
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
        const selectedMedium: QueryParamsMedium = medium || 'all';
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = getCategoryEnumValue(category);

        const recentConfig: FindManyOptions<Item> = {
          order: { pub_date: 'DESC' },
          skip: offset,
          take: limit,
          relations: itemGetManyRelationsWithChannel
        };
        const recentResults = await ItemController.itemService.getMany(
          recentConfig,
          medium_id,
          category_id,
          "normal"
        );
        const items = recentResults.filter(Boolean);

        const response: ApiListResponse<Item> = {
          data: items,
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
        
        const order = getStatsOrder(range);
        const config: FindManyOptions<StatsAggregatedItem> = {
          order: { [order]: 'DESC' },
          skip: offset,
          take: limit,
          relations: itemGetManyRelationsWithChannel
        };

        const statsResults = await ItemController.statsAggregatedItemService.getMany(
          config,
          medium_id,
          category_id,
          "normal"
        );

        const items = statsResults.map((stat: { item: Item }) => stat.item).filter(Boolean);
        const response: ApiListResponse<Item> = {
          data: items,
          meta: { page, count: null, limit }
        };
        res.json(response);
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
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
          const selectedMedium: QueryParamsMedium = medium || 'all';
          const medium_id = getMediumFromQueryParam(selectedMedium);

          const channel_ids = await getFollowedChannelIds(account_id, medium_id);
          if (!channel_ids.length) {
            const response: ApiListResponse<Item> = emptyApiListResponse;
            return res.json(response);
          }

          const config: FindManyOptions<Item> = {
            order: { pub_date: 'DESC' },
            skip: offset,
            take: limit,
            relations: itemGetManyRelationsWithChannel,
          };
          const items = await ItemController.itemService.getManyByChannels(channel_ids, config);

          const response: ApiListResponse<Item> = {
            data: items,
            meta: { page, count: null, limit }
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

          const channel_ids = await getFollowedChannelIds(account_id, medium_id);
          if (!channel_ids.length) {
            const response: ApiListResponse<Item> = emptyApiListResponse;
            return res.json(response);
          }

          const order = getStatsOrder(range);
          const config: FindManyOptions<StatsAggregatedItem> = {
            order: { [order]: 'DESC' },
            skip: offset,
            take: limit,
            relations: itemGetManyRelationsWithChannel
          };
          const statsResults = await ItemController.statsAggregatedItemService.getManyByChannels(
            config,
            channel_ids,
            medium_id,
            "normal"
          );
          const items = statsResults.map((stat: { item: Item }) => stat.item).filter(Boolean);

          const response: ApiListResponse<Item> = {
            data: items,
            meta: { page, count: null, limit }
          };
          res.json(response);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async getManyByChannelRecent(req: Request, res: Response): Promise<void> {
    validateParamsObject(getManyByChannelParmsSchema, req, res, async () => {
      validateQueryObject(getManyByChannelQuerySchema, req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const { channelIdOrIdText } = req.params;

          const channel = await ItemController.channelService.getByIdOrIdText(
            channelIdOrIdText,
            { channel_about: true }
          );

          if (!channel) {
            res.status(404).json({ message: 'Channel not found' });
            return;
          }

          const config: FindManyOptions<Item> = {
            skip: offset,
            take: limit,
            relations: itemGetManyRelations,
            order: { pub_date: 'DESC' }
          };
          const items = await ItemController.itemService.getManyByChannel(channel, config);

          res.json({ data: items, meta: { page, count: channel.channel_about.episode_count, limit } });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async getManyByChannelOldest(req: Request, res: Response): Promise<void> {
    validateParamsObject(getManyByChannelParmsSchema, req, res, async () => {
      validateQueryObject(getManyByChannelQuerySchema, req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const { channelIdOrIdText } = req.params;

          const channel = await ItemController.channelService.getByIdOrIdText(
            channelIdOrIdText,
            { channel_about: true }
          );

          if (!channel) {
            res.status(404).json({ message: 'Channel not found' });
            return;
          }

          const config: FindManyOptions<Item> = {
            skip: offset,
            take: limit,
            relations: itemGetManyRelations,
            order: { pub_date: 'ASC' }
          };
          const items = await ItemController.itemService.getManyByChannel(channel, config);

          res.json({ data: items, meta: { page, count: channel.channel_about.episode_count, limit } });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async getManyByChannelTop(req: Request, res: Response): Promise<void> {
    validateParamsObject(getManyByChannelParmsSchema, req, res, async () => {
      validateQueryObject(getManyByChannelTopQuerySchema, req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const { channelIdOrIdText } = req.params;
          const { range } = req.query as {
            range: QueryParamsStatsRange;
          };
          const medium_id = null;
          const category_id = null;

          const channel = await ItemController.channelService.getByIdOrIdText(
            channelIdOrIdText,
            { channel_about: true }
          );

          if (!channel) {
            res.status(404).json({ message: 'Channel not found' });
            return;
          }

          const order = getStatsOrder(range);
          const config: FindManyOptions<StatsAggregatedItem> = {
            order: { [order]: 'DESC' },
            skip: offset,
            take: limit,
            relations: subItemGetManyRelations,
            where: { item: { channel: { id: channel.id} } }
          };
          const statsResults = await ItemController.statsAggregatedItemService.getMany(
            config,
            medium_id,
            category_id,
            "normal"
          );
          const items = statsResults.map((stat: { item: Item }) => stat.item).filter(Boolean);

          res.json({ data: items, meta: { page, count: channel.channel_about.episode_count, limit } });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async getManyForQueueByPubDate(req: Request, res: Response): Promise<void> {
    validateParamsObject(getManyForQueueByPubDateParamsSchema, req, res, async () => {
      validateQueryObject(getManyForQueueByPubDateQuerySchema, req, res, async () => {
        try {
          const { direction } = req.query as QueryParamsDirection;

          const items = await ItemController
            .itemService
            .getManyForQueueByPubDate(
              req.params.idText,
              direction
            );
          
          res.json(items);
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
          .itemService.getByIdOrIdText(item_id_text, itemGetOneRelations);

        if (!item) {
          res.status(404).json({ message: 'Item not found' });
          return;
        }

        if (!item.item_chapters_feed) {
          res.status(204).end();
          return;
        }

        const lastFinished = item?.item_chapters_feed?.item_chapters_feed_log?.last_finished_parse_time;

        if (lastFinished) {
          const last = new Date(lastFinished).getTime();
          const now = Date.now();
          const diffMs = now - last;
          if (diffMs >= 1000 * 60 * 60) {
            await parseChapters(item);
          }
        } else {
          await parseChapters(item);
        }

        const updatedItem = await ItemController
          .itemService.getByIdOrIdText(item_id_text, itemGetOneRelations) as Item | null;
        
        if (!updatedItem || !updatedItem.item_chapters_feed) {
          res.status(404).json({ message: 'Item or Item Chapters Feed not found after parsing' });
          return;
        }

        const results = await ItemController.itemChapterService.getAllWithCount(
          updatedItem.item_chapters_feed, {
            order: { start_time: 'ASC' }
          }
        );

        const chapters = results.results;
        const transformed: typeof chapters = [];
        // Only consider chapters with table_of_contents true for end_time assignment
        const tocChapters = chapters.filter(ch => ch.table_of_contents);
        for (let i = 0; i < chapters.length; i++) {
          const ch = chapters[i];
          if (ch.table_of_contents) {
            // Find the next toc chapter ahead
            const nextToc = tocChapters.find(toc => parseFloat(toc.start_time) > parseFloat(ch.start_time));
            if (nextToc) {
              transformed.push({ ...ch, end_time: nextToc.start_time });
            } else {
              transformed.push({ ...ch });
            }
          } else {
            // Only include if end_time is present
            if (ch.end_time) {
              transformed.push(ch);
            }
          }
        }
        
        const response: ApiListResponse<Item> = {
          data: transformed,
          meta: { page: 1, count: transformed.length, limit: transformed.length }
        };

        res.json(response);
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }
}