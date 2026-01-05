import Joi from 'joi';
import { Request, Response } from 'express';
import { AccountSettingsLocaleService } from 'podverse-orm';
import { validateBodyObject } from '@api/lib/validation';
import { ensureAuthenticated } from '@api/lib/auth';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';

const createAccountSettingsLocaleSchema = Joi.object({
  locale: Joi.string().required()
});

const updateAccountSettingsLocaleSchema = Joi.object({
  locale: Joi.string().required()
});

export class AccountSettingsLocaleController {

  static async update(req: Request, res: Response): Promise<void> {
    validateBodyObject(updateAccountSettingsLocaleSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const account_id = req.user!.id;
          const { locale } = req.body;
          const service = new AccountSettingsLocaleService();
          const updated = await service.update({ account_id, locale });
          res.json({ data: updated });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }
  
}
