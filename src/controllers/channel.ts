import { Request, Response } from 'express';
import Joi from 'joi';
import { channelGetManyRelations, channelGetOneRelations, Channel, ChannelService,
  FindOptionsOrder, FindOptionsWhere } from 'podverse-orm';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams } from '@api/controllers/helpers/pagination';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { getCategoryEnumValue, categoryMappingKeys } from 'podverse-helpers';

const getByIdOrIdTextSchema = Joi.object({
  idOrIdText: Joi.string().required()
});

const getManySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional(),
  sort: Joi.string().valid('recent', 'oldest').optional(),
  category: Joi.string().valid(...categoryMappingKeys).optional()
});

class ChannelController {
  private static channelService = new ChannelService();

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
        const { category = undefined, sort = undefined } = req.query;

        const where = buildChannelWhere(category as string);
        const order = buildChannelOrder(sort as string);

        const channels = await ChannelController.channelService.getMany({
          skip: offset,
          take: limit,
          relations: channelGetManyRelations,
          ...(where && { where }),
          ...(order && { order }),
        });

        res.json({
          data: channels,
          meta: { page }
        });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }
}

type ChannelWhere = FindOptionsWhere<Channel>;
type ChannelOrder = FindOptionsOrder<Channel>;

function buildChannelWhere(category?: string): ChannelWhere | undefined {
  if (typeof category === 'string') {
    const category_id = getCategoryEnumValue(category);
    return { channel_categories: { category_id } } as ChannelWhere;
  }
  return undefined;
}

function buildChannelOrder(sort?: string): ChannelOrder | undefined {
  if (sort === 'recent') {
    return { channel_about: { last_pub_date: 'DESC' } } as ChannelOrder;
  }
  if (sort === 'oldest') {
    return { channel_about: { last_pub_date: 'ASC' } } as ChannelOrder;
  }
  return undefined;
}

export { ChannelController };
