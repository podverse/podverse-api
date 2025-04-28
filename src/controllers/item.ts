import { Request, Response } from 'express';
import Joi from 'joi';
import { itemGetOneRelations, itemGetManyRelations, ItemChapterService, ItemService } from 'podverse-orm';
import { parseChapters } from 'podverse-parser';
import { fetchChannel } from '@api/controllers/helpers/channel';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams } from '@api/controllers/helpers/pagination';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';

const getByIdOrIdTextSchema = Joi.object({
  idOrIdText: Joi.string().required()
});

const getManySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional(),
  liveItems: Joi.string().valid('true', 'false').optional()
});

const getManyByChannelSchema = Joi.object({
  channelIdOrIdText: Joi.string().required()
});

const parseAndGetChaptersSchema = Joi.object({
  item_id_text: Joi.string().required()
});

export class ItemController {
  private static itemService = new ItemService();
  private static itemChapterService = new ItemChapterService();

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
        const { liveItems } = req.query;
        const options = {
          skip: offset,
          take: limit,
          relations: itemGetManyRelations
        };

        const itemType = liveItems === 'true' ? 'live-item' : 'normal';

        const items = await ItemController.itemService.getMany(options, itemType);
        res.json({
          data: items,
          meta: { page }
        });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getManyByChannel(req: Request, res: Response): Promise<void> {
    validateParamsObject(getManyByChannelSchema, req, res, async () => {
      const { channelIdOrIdText } = req.params;
      try {
        const channel = await fetchChannel(channelIdOrIdText, res);
        if (channel) {
          const { page, limit, offset } = getPaginationParams(req);
          const options = {
            skip: offset,
            take: limit,
            relations: itemGetManyRelations
          };
          const items = await ItemController.itemService.getManyByChannel(channel, options);
          res.json({
            data: items,
            meta: { page }
          });
        }
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getManyWithLiveItemByChannel(req: Request, res: Response): Promise<void> {
    validateParamsObject(getManyByChannelSchema, req, res, async () => {
      const { channelIdOrIdText } = req.params;
      try {
        const channel = await fetchChannel(channelIdOrIdText, res);
        if (channel) {
          const { page, limit, offset } = getPaginationParams(req);
          const options = {
            skip: offset,
            take: limit,
            relations: itemGetManyRelations
          };
          const items = await ItemController.itemService.getManyWithLiveItemByChannel(channel, options);
          res.json({
            data: items,
            meta: { page }
          });
        }
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async parseAndGetChapters(req: Request, res: Response): Promise<void> {
    validateParamsObject(parseAndGetChaptersSchema, req, res, async () => {
      const { item_id_text } = req.params;
      try {
        const item = await ItemController.itemService.getByIdOrIdText(item_id_text, { relations: itemGetManyRelations });
        if (!item) {
          res.status(404).json({ message: 'Item not found' });
          return;
        }

        await parseChapters(item);

        const updatedItem = await ItemController.itemService.getByIdOrIdText(item_id_text, { relations: itemGetManyRelations });
        const chapters = await ItemController.itemChapterService.getAll(updatedItem.item_chapters_feed, {
          order: { start_time: 'ASC' }
        });

        res.json({ data: chapters });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }
}