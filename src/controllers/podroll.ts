import { Request, Response } from 'express';
import Joi from 'joi';
import { ChannelPodrollService } from 'podverse-orm';
import { validateParamsObject } from '@api/lib/validation';
import { buildRemoteItemsFinalResult } from '@api/lib/remoteItems';

const getPodrollForChannelSchema = Joi.object({
  idOrIdText: Joi.string().required()
});

export class PodrollController {
  private static channelPodrollService = new ChannelPodrollService();

  static async getPodrollForChannel(req: Request, res: Response): Promise<void> {
    validateParamsObject(getPodrollForChannelSchema, req, res, async () => {
      const { idOrIdText } = req.params;
      const result = await PodrollController
        .channelPodrollService
        .getPodrollForChannel(idOrIdText);

      const finalResult = await buildRemoteItemsFinalResult(
        result.podrollChannelsAdded,
        result.podrollChannelsUnadded,
        result.podrollItemsAdded,
        result.podrollItemsUnadded
      );

      res.json(finalResult);
    });
  }
}
