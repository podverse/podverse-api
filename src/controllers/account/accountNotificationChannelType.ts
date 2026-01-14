import { Request, Response } from 'express';
import { AccountNotificationChannelTypeService } from 'podverse-orm';
import Joi from 'joi';
import { ACCOUNT_NOTIFICATION_TYPE_VALUES, AccountNotificationTypeEnum } from 'podverse-helpers';
import { ensureAuthenticated } from '@api/lib/auth';
import { handleGenericErrorResponse } from '../helpers/error';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';

const createNotificationChannelTypeSchema = Joi.object({
  channel_id_text: Joi.string().required(),
  type: Joi.string().valid(...ACCOUNT_NOTIFICATION_TYPE_VALUES).required()
});

const deleteNotificationChannelTypeSchema = Joi.object({
  channel_id_text: Joi.string().required(),
  type: Joi.string().valid(...ACCOUNT_NOTIFICATION_TYPE_VALUES).required()
});

class AccountNotificationChannelTypeController {
  private static accountNotificationChannelTypeService = new AccountNotificationChannelTypeService();

  static async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(createNotificationChannelTypeSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { channel_id_text, type } = req.body as { channel_id_text: string; type: AccountNotificationTypeEnum };
          const notificationChannelType = await AccountNotificationChannelTypeController
            .accountNotificationChannelTypeService.create(jwtUser.id, channel_id_text, type);
          res.status(201).json(notificationChannelType);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    }, { skipMembershipStatus: false });
  }

  static async delete(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateParamsObject(deleteNotificationChannelTypeSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { channel_id_text, type } = req.params as { channel_id_text: string; type: AccountNotificationTypeEnum };
          await AccountNotificationChannelTypeController
            .accountNotificationChannelTypeService.delete(jwtUser.id, channel_id_text, type);
          res.status(204).end();
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    }, { skipMembershipStatus: true });
  }
}

export { AccountNotificationChannelTypeController };
