import { Request, Response } from "express";
import Joi from "joi";
import { MQ_QUEUES } from "podverse-helpers";
import { mqRSSAdd } from "podverse-mq";
import { ensureAuthenticated } from "@api/lib/auth";
import { validateBodyObject } from "@api/lib/validation";
import { handleGenericErrorResponse } from "../helpers/error";
import { activeMQArtemisService } from "@api/factories/activeMQArtemisService";
import { rateLimitAuthEndpoint } from "@api/lib/rateLimiter";

const addToOnDemandMQSchema = Joi.object({
  url: Joi.string().uri().required(),
  podcast_index_id: Joi.number().min(1).required()
});

export class MQController {
  static rssOnDemandMiddleware = rateLimitAuthEndpoint({
    windowMs: 60 * 60 * 1000,
    max: 10
  });

  static async rssAddToOnDemandMQ(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      console.log("Authenticated user:", req.user);
      MQController.rssOnDemandMiddleware(req, res, () => {
        validateBodyObject(addToOnDemandMQSchema, req, res, async () => {
          const dto = req.body;
          const finalDto = {
            url: dto.url,
            podcast_index_id: dto.podcast_index_id
          };

          console.log("dto", dto);
          console.log("finalDto", finalDto);
          console.log("Authenticated user inside rssAddToOnDemandMQ:", req.user);
          try {
            const mqConstantMessageOptions = MQ_QUEUES['rss-on-demand'];
            console.log("mqConstantMessageOptions", mqConstantMessageOptions);
            await mqRSSAdd(activeMQArtemisService, {
              ...mqConstantMessageOptions,
              feedUrl: finalDto.url,
              podcast_index_id: finalDto.podcast_index_id
            });
            res.status(201).json({ message: "Feed added to on-demand queue successfully." });
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }
}
