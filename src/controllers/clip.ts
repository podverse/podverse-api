import {
  ApiListResponse,
  CATEGORY_MAPPING_KEYS,
  CategoryMappingKeys,
  getCategoryEnumValue,
  getMediumFromQueryParam,
  QUERY_PARAMS_MEDIUMS,
  QUERY_PARAMS_STATS_RANGE_VALUES,
  QueryParamsMedium,
  QueryParamsStatsRange,
  SharableStatusEnum
} from 'podverse-helpers';
import { NextFunction, Request, Response } from 'express';
import { ensureAuthenticated, optionalEnsureAuthenticated } from '../lib/auth';
import Joi from 'joi';
import { ChannelService, Clip, ClipService, FindManyOptions, ItemService, StatsAggregatedClip, StatsAggregatedClipService } from 'podverse-orm';
import { handleGenericErrorResponse } from './helpers/error';
import { validateBodyObject, validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { getPaginationParams } from './helpers/pagination';
import { getStatsOrder } from '@api/lib/stats';

const clipCreateSchema = Joi.object({
  start_time: Joi.number().min(0).required(),
  end_time: Joi.number().greater(0).allow(null, ''),
  title: Joi.string().allow(null, ''),
  description: Joi.string().allow(null, ''),
  item_id_text: Joi.string().required(),
  sharable_status_id: Joi.number().min(1).required(),
});

const clipUpdateSchema = Joi.object({
  start_time: Joi.number().min(0).required(),
  end_time: Joi.number().greater(0).allow(null, ''),
  title: Joi.string().allow(null, ''),
  description: Joi.string().allow(null, ''),
  item_id_text: Joi.string().required(),
  sharable_status_id: Joi.number().min(1).required(),
});

const clipIdSchema = Joi.object({
  clip_id_text: Joi.string().required(),
});

const getByChannelIdTextSchema = Joi.object({
  channel_id_text: Joi.string().required()
});

const getByItemIdTextSchema = Joi.object({
  item_id_text: Joi.string().required()
});

const getClipsPublicManyRecentSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
});

const getClipsPublicManyOldestSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
});

const getClipsPublicTopSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required()
});

const getClipsPublicManyCategoryRecentSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  category: Joi.string().valid(...CATEGORY_MAPPING_KEYS).required()
});

const getClipsPublicManyCategoryOldestSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  category: Joi.string().valid(...CATEGORY_MAPPING_KEYS).required()
});

const getClipsPublicManyCategoryTopSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  medium: Joi.string().valid(...QUERY_PARAMS_MEDIUMS).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required(),
  category: Joi.string().valid(...CATEGORY_MAPPING_KEYS).required()
});

const getClipsPublicByChannelRecentSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
});

const getClipsPublicByChannelOldestSchema = Joi.object({
  page: Joi.number().integer().min(1).required()
});

const getClipsPublicByChannelTopSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required()
});

const getClipsPublicByItemRecentSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
});

const getClipsPublicByItemOldestSchema = Joi.object({
  page: Joi.number().integer().min(1).required()
});

const getClipsPublicByItemTopSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required()
});

const clipPublicManyRelations = [
  "item",
  "item.item_enclosures",
  "item.item_enclosures.item_enclosure_sources",
  "item.item_images",
  "item.channel",
  "item.channel.channel_images",
  "account",
  "sharable_status"
];

const clipPublicManyChannelRelations = [
  "item",
  "item.item_enclosures",
  "item.item_enclosures.item_enclosure_sources",
  "item.item_images",
  "account",
  "sharable_status"
];

const clipPublicManyItemRelations = [
  "account",
  "sharable_status"
];

const statsAggregationRelations = [
  "clip",
  "clip.item",
  "clip.item.item_enclosures",
  "clip.item.item_enclosures.item_enclosure_sources",
  "clip.item.item_images",
  "clip.item.channel",
  "clip.item.channel.channel_images",
  "clip.account",
  "clip.sharable_status"
];

const statsAggregationChannelRelations = [
  "clip",
  "clip.item",
  "clip.item.item_enclosures",
  "clip.item.item_enclosures.item_enclosure_sources",
  "clip.item.item_images",
  "clip.account",
  "clip.sharable_status"
];

const statsAggregationItemRelations = [
  "clip",
  "clip.account",
  "clip.sharable_status"
];

const channelService = new ChannelService();
const itemService = new ItemService();
const clipService = new ClipService();

const verifyClipOwnership = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const account = req.user!;
    const { clip_id_text } = req.params;

    try {
      const clip = await clipService.getByIdText(clip_id_text, { relations: ['account'] });
      if (!clip) {
        return res.status(404).json({ message: 'Clip not found' });
      }

      if (clip.account.id !== account.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      handleGenericErrorResponse(res, err);
    }
  };
};

const verifyPrivateClipOwnership = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const account = req.user;
    const { clip_id_text } = req.params;

    try {
      const clip = await clipService.getByIdText(clip_id_text, {
        relations: ['account', 'sharable_status'],
      });

      if (!clip) {
        return res.status(404).json({ message: 'Clip not found' });
      }

      if (clip.sharable_status.id === SharableStatusEnum.Private) {
        if (!account?.id || clip.account.id !== account.id) {
          return res.status(404).json({ message: 'Clip not found' });
        }
      }

      next();
    } catch (err) {
      handleGenericErrorResponse(res, err);
    }
  };
};

class ClipController {
  private static statsAggregatedClipService = new StatsAggregatedClipService();

  static async createClip(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(clipCreateSchema, req, res, async () => {
        const account = req.user!;
        const dto = req.body;

        const finalDto = {
          title: dto.title || null,
          description: dto.description || null,
          start_time: dto.start_time,
          end_time: dto.end_time || null,
          item_id_text: dto.item_id_text,
          sharable_status_id: dto.sharable_status_id
        };

        try {
          const clip = await clipService.create(account.id, finalDto);
          res.status(201).json(clip);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async updateClip(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateParamsObject(clipIdSchema, req, res, () => {
        verifyClipOwnership()(req, res, () => {
          validateBodyObject(clipUpdateSchema, req, res, async () => {
            const account = req.user!;
            const { clip_id_text } = req.params;
            const dto = req.body;

            const finalDto = {
              title: dto.title || null,
              description: dto.description || null,
              start_time: dto.start_time,
              end_time: dto.end_time || null,
              item_id_text: dto.item_id_text,
              sharable_status_id: dto.sharable_status_id
            };

            try {
              const clip = await clipService.update(account.id, clip_id_text, finalDto);
              res.status(200).json(clip);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async deleteClip(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateParamsObject(clipIdSchema, req, res, () => {
        verifyClipOwnership()(req, res, async () => {
          const account = req.user!;
          const { clip_id_text } = req.params;

          try {
            await clipService.delete(account.id, clip_id_text);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getClipByIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(clipIdSchema, req, res, () => {
      optionalEnsureAuthenticated(req, res, () => {
        verifyPrivateClipOwnership()(req, res, async () => {
          try {
            const { clip_id_text } = req.params;
            const clip = await clipService.getByIdText(
              clip_id_text,
              {
                relations: [
                  "item",
                  "item.item_enclosures",
                  "item.item_enclosures.item_enclosure_sources",
                  "item.item_images",
                  "item.channel",
                  "item.channel.channel_images",
                  "account",
                  "sharable_status"
                ]
              }
            );
            if (clip) {
              delete clip.id;
              res.status(200).json(clip);
            } else {
              res.status(404).json({ message: 'Clip not found' });
            }
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getClipsPrivate(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const account = req.user!;
        const clips = await clipService.getManyByAccount(account.id);
        res.status(200).json(clips);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getManyPublicRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getClipsPublicManyRecentSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { medium } = req.query as {
          medium: QueryParamsMedium;
        };

        const selectedMedium: QueryParamsMedium = medium;
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = null;
 
        const [clips, count] = await clipService.getManyPublic(
          medium_id,
          category_id,
          {
            order: { created_at: 'DESC' },
            skip: offset,
            take: limit,
            relations: clipPublicManyRelations
          }
        );

        const response: ApiListResponse<Clip> = {
          data: clips,
          meta: { page, count, limit }
        };

        res.status(200).json(response);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getManyPublicOldest(req: Request, res: Response): Promise<void> {
    validateQueryObject(getClipsPublicManyOldestSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { medium } = req.query as {
          medium: QueryParamsMedium;
        };

        const selectedMedium: QueryParamsMedium = medium;
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = null;
 
        const [clips, count] = await clipService.getManyPublic(
          medium_id,
          category_id,
          {
            order: { created_at: 'ASC' },
            skip: offset,
            take: limit,
            relations: clipPublicManyRelations
          }
        );

        const response: ApiListResponse<Clip> = {
          data: clips,
          meta: { page, count, limit }
        };

        res.status(200).json(response);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getManyPublicTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getClipsPublicTopSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { range, medium } = req.query as {
          range: QueryParamsStatsRange;
          medium: QueryParamsMedium;
        };

        const selectedMedium: QueryParamsMedium = medium;
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = null;

        const order = getStatsOrder(range);
        const config: FindManyOptions<StatsAggregatedClip> = {
          order: { [order]: 'DESC' },
          skip: offset,
          take: limit,
          relations: statsAggregationRelations
        };
        const [statsResults, count] = await ClipController
          .statsAggregatedClipService.getManyAndCountPublic(config, medium_id, category_id);
        const clips = statsResults.map((stat: { clip: Clip }) => stat.clip).filter(Boolean);

        const response: ApiListResponse<Clip> = {
          data: clips,
          meta: { page, count, limit }
        };

        res.status(200).json(response);  
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getManyByCategoryPublicRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getClipsPublicManyCategoryRecentSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { medium, category } = req.query as {
          medium: QueryParamsMedium;
          category: CategoryMappingKeys;
        };

        const selectedMedium: QueryParamsMedium = medium;
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = getCategoryEnumValue(category);
 
        const [clips, count] = await clipService.getManyPublic(
          medium_id,
          category_id,
          {
            order: { created_at: 'DESC' },
            skip: offset,
            take: limit,
            relations: clipPublicManyRelations
          }
        );

        const response: ApiListResponse<Clip> = {
          data: clips,
          meta: { page, count, limit }
        };

        res.status(200).json(response);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getManyByCategoryPublicOldest(req: Request, res: Response): Promise<void> {
    validateQueryObject(getClipsPublicManyCategoryOldestSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { medium, category } = req.query as {
          medium: QueryParamsMedium;
          category: CategoryMappingKeys;
        };

        const selectedMedium: QueryParamsMedium = medium;
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = getCategoryEnumValue(category);
 
        const [clips, count] = await clipService.getManyPublic(
          medium_id,
          category_id,
          {
            order: { created_at: 'ASC' },
            skip: offset,
            take: limit,
            relations: clipPublicManyRelations
          }
        );

        const response: ApiListResponse<Clip> = {
          data: clips,
          meta: { page, count, limit }
        };

        res.status(200).json(response);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getManyByCategoryPublicTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getClipsPublicManyCategoryTopSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { range, medium, category } = req.query as {
          range: QueryParamsStatsRange;
          medium: QueryParamsMedium;
          category: CategoryMappingKeys;
        };

        const selectedMedium: QueryParamsMedium = medium;
        const medium_id = getMediumFromQueryParam(selectedMedium);
        const category_id = getCategoryEnumValue(category);

        const order = getStatsOrder(range);
        const config: FindManyOptions<StatsAggregatedClip> = {
          order: { [order]: 'DESC' },
          skip: offset,
          take: limit,
          relations: statsAggregationRelations
        };
        const [statsResults, count] = await ClipController
          .statsAggregatedClipService.getManyAndCountPublic(config, medium_id, category_id);
        const clips = statsResults.map((stat: { clip: Clip }) => stat.clip).filter(Boolean);

        const response: ApiListResponse<Clip> = {
          data: clips,
          meta: { page, count, limit }
        };

        res.status(200).json(response);  
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getManyByChannelPublicRecent(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByChannelIdTextSchema, req, res, async () => {
      validateQueryObject(getClipsPublicByChannelRecentSchema, req, res, async () => {
        try {
          const { channel_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);

          const channel = await channelService.getByIdText(channel_id_text);
          if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
          }
          
          const [clips, count] = await clipService.getManyByChannelAndCountPublic(
            channel_id_text,
            {
              order: { created_at: 'DESC' },
              skip: offset,
              take: limit,
              relations: clipPublicManyChannelRelations
            }
          );
          
          const response: ApiListResponse<Clip> = {
            data: clips,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyByChannelPublicOldest(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByChannelIdTextSchema, req, res, async () => {
      validateQueryObject(getClipsPublicByChannelOldestSchema, req, res, async () => {
        try {
          const { channel_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);

          const channel = await channelService.getByIdText(channel_id_text);
          if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
          }

          const [clips, count] = await clipService.getManyByChannelAndCountPublic(
            channel_id_text,
            {
              order: { created_at: 'ASC' },
              skip: offset,
              take: limit,
              relations: clipPublicManyChannelRelations
            }
          );
          
          const response: ApiListResponse<Clip> = {
            data: clips,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyByChannelPublicTop(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByChannelIdTextSchema, req, res, async () => {
      validateQueryObject(getClipsPublicByChannelTopSchema, req, res, async () => {
        try {
          const { channel_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);
          const { range } = req.query as {
            range: QueryParamsStatsRange;
          };

          const order = getStatsOrder(range);

          const channel = await channelService.getByIdText(channel_id_text);
          if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
          }

          const results = await ClipController.statsAggregatedClipService.getManyByChannelsAndCountPublic(
            [channel.id],
            {
              order: { [order]: 'DESC' },
              skip: offset,
              take: limit,
              relations: statsAggregationChannelRelations
            }
          );
          const statsResults = results[0];
          const count = results[1];
          const clips = statsResults.map((s: { clip: Clip }) => s.clip).filter(Boolean);

          const response: ApiListResponse<Clip> = {
            data: clips,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyByItemPublicRecent(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByItemIdTextSchema, req, res, async () => {
      validateQueryObject(getClipsPublicByItemRecentSchema, req, res, async () => {
        try {
          const { item_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);

          const item = await itemService.getByIdText(item_id_text);
          if (!item) {
            return res.status(404).json({ message: 'Item not found' });
          }
          
          const [clips, count] = await clipService.getManyByItemAndCountPublic(
            item_id_text,
            {
              order: { created_at: 'DESC' },
              skip: offset,
              take: limit,
              relations: clipPublicManyItemRelations
            }
          );
          
          const response: ApiListResponse<Clip> = {
            data: clips,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyByItemPublicOldest(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByItemIdTextSchema, req, res, async () => {
      validateQueryObject(getClipsPublicByItemOldestSchema, req, res, async () => {
        try {
          const { item_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);

          const item = await itemService.getByIdText(item_id_text);
          if (!item) {
            return res.status(404).json({ message: 'Item not found' });
          }
          
          const [clips, count] = await clipService.getManyByItemAndCountPublic(
            item_id_text,
            {
              order: { created_at: 'ASC' },
              skip: offset,
              take: limit,
              relations: clipPublicManyItemRelations
            }
          );
          
          const response: ApiListResponse<Clip> = {
            data: clips,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyByItemPublicTop(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByItemIdTextSchema, req, res, async () => {
      validateQueryObject(getClipsPublicByItemTopSchema, req, res, async () => {
        try {
          const { item_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);
          const { range } = req.query as {
            range: QueryParamsStatsRange;
          };

          const order = getStatsOrder(range);

          const item = await itemService.getByIdText(item_id_text);
          if (!item) {
            return res.status(404).json({ message: 'Item not found' });
          }

          const results = await ClipController.statsAggregatedClipService.getManyByItemAndCountPublic(
            item.id,
            {
              order: { [order]: 'DESC' },
              skip: offset,
              take: limit,
              relations: statsAggregationItemRelations
            }
          );
          const statsResults = results[0];
          const count = results[1];
          const clips = statsResults.map((s: { clip: Clip }) => s.clip).filter(Boolean);

          const response: ApiListResponse<Clip> = {
            data: clips,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

}

export { ClipController };
