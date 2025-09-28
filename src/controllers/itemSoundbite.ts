import { Request, Response } from 'express';
import Joi from 'joi';
import { ApiListResponse, QueryParamsItemSoundbitesByChannelSort,
  QueryParamsItemSoundbitesByItemSort } from 'podverse-helpers';
import { ItemSoundbite, ItemSoundbiteService } from 'podverse-orm';
import { handleGenericErrorResponse } from './helpers/error';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { getPaginationParams } from './helpers/pagination';

const getItemSoundbitesByChannelIdTextSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid("recent", "oldest").optional()
});

const getItemSoundbitesByItemIdTextSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid("recent", "oldest").optional()
});

const itemSoundbiteIdTextSchema = Joi.object({
  item_soundbite_id_text: Joi.string().required(),
});

const getByChannelIdTextSchema = Joi.object({
  channel_id_text: Joi.string().required(),
});

const getByItemIdTextSchema = Joi.object({
  item_id_text: Joi.string().required(),
});

const itemSoundbiteService = new ItemSoundbiteService();

export class ItemSoundbiteController {

  static async getItemSoundbiteById(req: Request, res: Response): Promise<void> {
    validateParamsObject(itemSoundbiteIdTextSchema, req, res, async () => {
      try {
        const { item_soundbite_id_text } = req.params;
        const itemSoundbite = await itemSoundbiteService.getByIdText(item_soundbite_id_text);
        if (itemSoundbite) {
          res.status(200).json(itemSoundbite);
        } else {
          res.status(404).json({ message: 'Item soundbite not found' });
        }
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async getManyByChannelIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByChannelIdTextSchema, req, res, async () => {
      validateQueryObject(getItemSoundbitesByChannelIdTextSchema, req, res, async () => {
        try {
          const { channel_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);
          const { sort } = req.query as {
            sort?: QueryParamsItemSoundbitesByChannelSort;
          };

          let order = { item: { pub_date: 'DESC' } };
          if (sort === "oldest") {
            order = { item: { pub_date: "ASC" } };
          }
  
          const [item_soundbites, count] = await itemSoundbiteService.getManyAndCount({
            where: {
              item: {
                channel: { id_text: channel_id_text }
              }
            },
            order,
            skip: offset,
            take: limit,
            relations: [
              'item',
              'item.item_enclosures',
              'item.item_enclosures.item_enclosure_sources',
              'item.item_images'
            ]
          });

          const response: ApiListResponse<ItemSoundbite> = {
            data: item_soundbites,
            meta: { page, count, limit }
          };

          res.status(200).json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async getManyByItemIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByItemIdTextSchema, req, res, async () => {
      validateQueryObject(getItemSoundbitesByItemIdTextSchema, req, res, async () => {
        try {
          const { item_id_text } = req.params;
          const { page, limit, offset } = getPaginationParams(req);
          const { sort } = req.query as {
            sort?: QueryParamsItemSoundbitesByItemSort;
          };

          let order = { item: { pub_date: 'DESC' } };
          if (sort === "oldest") {
            order = { item: { pub_date: "ASC" } };
          }
  
          const [item_soundbites, count] = await itemSoundbiteService.getManyAndCount({
            where: {
              item: { id_text: item_id_text }
            },
            order,
            skip: offset,
            take: limit,
            relations: [
              'item',
              'item.item_enclosures',
              'item.item_enclosures.item_enclosure_sources',
              'item.item_images'
            ]
          });

          const response: ApiListResponse<ItemSoundbite> = {
            data: item_soundbites,
            meta: { page, count, limit }
          };

          res.status(200).json(response);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }
}
