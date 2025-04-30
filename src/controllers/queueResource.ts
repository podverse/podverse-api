import { Request, Response } from 'express';
import Joi from 'joi';
import { QueueResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from './helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';
import { verifyQueueOwnership } from '@api/controllers/queue';
import { validateParamsObject } from '@api/lib/validation';

const queueIdSchema = Joi.object({
  queue_id: Joi.string().required()
});

class QueueResourceController {
  private static queueResourceService = new QueueResourceService();

  static async getAllByQueueIdPrivate(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id } = req.params;

          try {
            const queueResources = await QueueResourceController.queueResourceService.getAllByQueueId(queue_id);
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