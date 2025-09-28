import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { ApiListResponse, QUERY_PARAMS_STATS_RANGE_VALUES, QueryParamsClipsByChannelSort, QueryParamsStatsRange, SharableStatusEnum } from 'podverse-helpers';
import { Clip, ClipService, FindManyOptions, StatsAggregatedClip, StatsAggregatedClipService } from 'podverse-orm';
import { ensureAuthenticated, optionalEnsureAuthenticated } from '@api/lib/auth';
import { handleGenericErrorResponse } from './helpers/error';
import { validateBodyObject, validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { getPaginationParams } from './helpers/pagination';
import { getStatsOrder } from '@api/lib/stats';

const getClipsPublicByChannelIdTextSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid("top", "recent", "oldest").optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional()
});

const getClipsPublicByItemIdTextSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid("top", "recent", "oldest").optional(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).optional()
});

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

  static async getClipById(req: Request, res: Response): Promise<void> {
    validateParamsObject(clipIdSchema, req, res, () => {
      optionalEnsureAuthenticated(req, res, () => {
        verifyPrivateClipOwnership()(req, res, async () => {
          try {
            const { clip_id_text } = req.params;
            const clip = await clipService.getByIdText(
              clip_id_text,
              {
                select: {
                  id: true,
                  id_text: true,
                  start_time: true,
                  end_time: true,
                  title: true,
                  description: true,
                  created_at: true,
                  item: {
                    id_text: true,
                    title: true,
                    pub_date: true,
                    item_enclosures: true,
                    item_images: true,
                    channel: {
                      id_text: true,
                      title: true,
                      channel_images: true
                    }
                  },
                  account: {
                    id_text: true
                  },
                  sharable_status: {
                    id: true
                  }
                },
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

  static async getClipsPublic(req: Request, res: Response): Promise<void> {
    try {
      const clips = await clipService.getMany({
        where: { sharable_status_id: { id: SharableStatusEnum.Public } },
        relations: ['sharable_status']
      });
      res.status(200).json(clips);
    } catch (err) {
      handleGenericErrorResponse(res, err);
    }
  }

  static async getManyByChannelIdTextPublic(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByChannelIdTextSchema, req, res, async () => {
      validateQueryObject(getClipsPublicByChannelIdTextSchema, req, res, async () => {
        try {
          const { channel_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);
          const { sort, range } = req.query as {
            sort?: QueryParamsClipsByChannelSort;
            range?: QueryParamsStatsRange
          };

          const select = {
            id: true,
            id_text: true,
            start_time: true,
            end_time: true,
            title: true,
            description: true,
            created_at: true,
            item: {
              id: true,
              id_text: true,
              pub_date: true,
              title: true,
              item_enclosures: true,
              item_images: true
            },
            account: {
              id_text: true
            }
          };

          if (sort === "top") {
            const order = getStatsOrder(range);
            const config: FindManyOptions<StatsAggregatedClip> = {
              order: { [order]: 'DESC' },
              skip: offset,
              take: limit,
              select: {
                clip: {
                  ...select
                }
              },
              relations: [
                "clip",
                "clip.item",
                "clip.item.item_enclosures",
                "clip.item.item_enclosures.item_enclosure_sources",
                "clip.item.item_images",
                "clip.account"
              ]
            };
            const [statsResults, count] = await ClipController
              .statsAggregatedClipService.getManyAndCountPublic(config);
            const clips = statsResults.map((stat: { clip: Clip }) => stat.clip).filter(Boolean);

            const response: ApiListResponse<Clip> = {
              data: clips,
              meta: { page, count, limit }
            };

            res.status(200).json(response);  
          } else {
            let order = { created_at: 'DESC' };
            if (sort === "oldest") {
              order = { created_at: "ASC" };
            }
    
            const [clips, count] = await clipService.getManyAndCount({
              where: {
                sharable_status: { id: SharableStatusEnum.Public },
                item: {
                  channel: { id_text: channel_id_text }
                }
              },
              order,
              skip: offset,
              take: limit,
              select,
              relations: [
                'item',
                'item.item_enclosures',
                'item.item_enclosures.item_enclosure_sources',
                'item.item_images',
                'account'
              ]
            });
  
            const response: ApiListResponse<Clip> = {
              data: clips,
              meta: { page, count, limit }
            };
  
            res.status(200).json(response);
          }
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyByItemIdTextPublic(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByItemIdTextSchema, req, res, async () => {
      validateQueryObject(getClipsPublicByItemIdTextSchema, req, res, async () => {
        try {
          const { item_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);
          const { sort, range } = req.query as {
            sort?: QueryParamsClipsByChannelSort;
            range?: QueryParamsStatsRange
          };

          const select = {
            id: true,
            id_text: true,
            start_time: true,
            end_time: true,
            title: true,
            description: true,
            created_at: true,
            account: {
              id_text: true
            }
          };

          if (sort === "top") {
            const order = getStatsOrder(range);
            const config: FindManyOptions<StatsAggregatedClip> = {
              order: { [order]: 'DESC' },
              skip: offset,
              take: limit,
              select: {
                clip: {
                  ...select
                }
              },
              relations: [
                "clip",
                "clip.account"
              ]
            };
            const [statsResults, count] = await ClipController
              .statsAggregatedClipService.getManyAndCountPublic(config);
            const clips = statsResults.map((stat: { clip: Clip }) => stat.clip).filter(Boolean);

            const response: ApiListResponse<Clip> = {
              data: clips,
              meta: { page, count, limit }
            };

            res.status(200).json(response);  
          } else {
            let order = { created_at: 'DESC' };
            if (sort === "oldest") {
              order = { created_at: "ASC" };
            }
    
            const [clips, count] = await clipService.getManyAndCount({
              where: {
                sharable_status: { id: SharableStatusEnum.Public },
                item: { id_text: item_id_text }
              },
              order,
              skip: offset,
              take: limit,
              select,
              relations: [
                'account'
              ]
            });
  
            const response: ApiListResponse<Clip> = {
              data: clips,
              meta: { page, count, limit }
            };
  
            res.status(200).json(response);
          }
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
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
}

export { ClipController };
