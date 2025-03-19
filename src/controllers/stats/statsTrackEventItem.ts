import { Request, Response } from 'express';
import Joi from 'joi';
import { StatsTrackEventItemService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateBodyObject } from '@api/lib/validation';

const createStatsTrackEventItemSchema = Joi.object({
  item_id_text: Joi.string().required()
});

export class StatsTrackEventItemController {
  private static statsTrackEventItemService = new StatsTrackEventItemService();

  static async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(createStatsTrackEventItemSchema, req, res, async () => {
        const jwtUser = req.user!;
        const { item_id_text } = req.body;

        try {
          await StatsTrackEventItemController.statsTrackEventItemService._create(jwtUser.id, item_id_text);
          res.status(201).json({ message: 'Event logged successfully' });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }
}