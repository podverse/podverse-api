import Joi from 'joi';
import { Request, Response } from 'express';
import { ACCOUNT_NOTIFICATION_TYPE_VALUES } from 'podverse-helpers';
import { AccountSettingsNotificationTypeService } from 'podverse-orm';
import { validateBodyObject } from '@api/lib/validation';
import { ensureAuthenticated } from '@api/lib/auth';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';

const createAccountSettingsNotificationTypeSchema = Joi.object({
  type: Joi.string().valid(...ACCOUNT_NOTIFICATION_TYPE_VALUES).required()
});

const deleteAccountSettingsNotificationTypeSchema = Joi.object({
  type: Joi.string().valid(...ACCOUNT_NOTIFICATION_TYPE_VALUES).required()
});

export class AccountSettingsNotificationTypeController {
  static async create(req: Request, res: Response): Promise<void> {
    validateBodyObject(createAccountSettingsNotificationTypeSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const account_id = req.user!.id;
          const { type } = req.body;  
          const service = new AccountSettingsNotificationTypeService();
          const created = await service.create({ account_id, type });
          res.json({ data: created });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async delete(req: Request, res: Response): Promise<void> {
    validateBodyObject(deleteAccountSettingsNotificationTypeSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const account_id = req.user!.id;
          const { type } = req.body;
          const service = new AccountSettingsNotificationTypeService();
          await service.delete(type, account_id);
          res.json({ message: 'Deleted' });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }
}
