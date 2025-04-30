import { Request, Response } from 'express';
import Joi from 'joi';
import { channelGetManyRelations, channelGetOneRelations, ChannelService } from 'podverse-orm';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams } from '@api/controllers/helpers/pagination';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';

const getByIdOrIdTextSchema = Joi.object({
  idOrIdText: Joi.string().required()
});

const getManySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional()
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
        const channels = await ChannelController.channelService.getMany({
          skip: offset,
          take: limit,
          relations: channelGetManyRelations
        });

        res.json({
          data: channels,
          meta: {
            page
          }
        });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }
}

export { ChannelController };
