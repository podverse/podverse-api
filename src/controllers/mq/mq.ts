import { Request, Response } from "express";
import Joi from "joi";
import { ensureAuthenticated } from "@api/lib/auth";
import { validateBodyObject } from "@api/lib/validation";
import { handleGenericErrorResponse } from "../helpers/error";
import { activeMQArtemisService } from "@api/factories/activeMQArtemisService";
import { queueRSSAdd } from "podverse-queue";

const addToOnDemandMQSchema = Joi.object({
  url: Joi.string().uri().required(),
  podcast_index_id: Joi.number().min(1).required()
});

export class MQController {

  static async addToOnDemandMQ(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(addToOnDemandMQSchema, req, res, async () => {
        const dto = req.body;

        const finalDto = {
          url: dto.url,
          podcast_index_id: dto.podcast_index_id
        };

        try {
          queueRSSAdd(activeMQArtemisService, {
            queueName: "rss-on-demand",
            feedUrl: finalDto.url,
            podcastIndexId: finalDto.podcast_index_id,
            priority: 'normal'
          });
          res.status(201).json({ message: "Feed added to on-demand queue successfully." });
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }
  
}
