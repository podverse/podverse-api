import { Request, Response } from 'express';
import Joi from 'joi';
import { QueueResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '../helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';
import { verifyQueueOwnership } from '@api/controllers/queue/queue';
import { validateParamsObject } from '@api/lib/validation';

const queueIdSchema = Joi.object({
  queue_id_text: Joi.string().required()
});

class QueueResourceController {
  private static queueResourceService = new QueueResourceService();

  static async getAllByQueueIdTextPrivate(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text } = req.params;

          try {
            const queueResources = await QueueResourceController
              .queueResourceService
              .getAllByQueueIdText(queue_id_text);
            res.status(200).json(queueResources);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getNowPlayingByQueueIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text } = req.params;

          try {
            const queueResources = await QueueResourceController
              .queueResourceService
              .getNowPlayingByQueueIdText(queue_id_text);
            res.status(200).json(queueResources);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getAllUpcomingByQueueIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text } = req.params;

          try {
            const queueResources = await QueueResourceController
              .queueResourceService
              .getAllUpcomingByQueueIdText(queue_id_text);
            res.status(200).json(queueResources);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

}

export { QueueResourceController };