import { Request, Response } from 'express';
import Joi from 'joi';
import { StatsTrackEventAccountService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateBodyObject } from '@api/lib/validation';

const createStatsTrackEventAccountSchema = Joi.object({
  account_id_text: Joi.string().required()
});

export class StatsTrackEventAccountController {
  private static statsTrackEventAccountService = new StatsTrackEventAccountService();

  static async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(createStatsTrackEventAccountSchema, req, res, async () => {
        const jwtUser = req.user!;
        const { account_id_text } = req.body;

        try {
          await StatsTrackEventAccountController.statsTrackEventAccountService._create(jwtUser.id, account_id_text);
          res.status(201).json({ message: 'Event logged successfully' });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    }, { skipMembershipStatus: false });
  }
}