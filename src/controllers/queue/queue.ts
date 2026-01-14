import { NextFunction, Request, Response } from 'express';
import { QueueService } from 'podverse-orm';
import { ensureAuthenticated } from '@api/lib/auth';
import { handleGenericErrorResponse } from '../helpers/error';
import Joi from 'joi';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';

const queueIdTextParamsSchema = Joi.object({
  queue_id_text: Joi.string().required()
});

const updateIsActiveQueueSchema = Joi.object({
  is_active_queue: Joi.boolean().required()
});

const queueService = new QueueService();

export const verifyQueueOwnership = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const account = req.user!;
    const { queue_id_text } = req.params;

    try {
      const queue = await queueService.getByIdText(queue_id_text, { relations: ['account'] });
      if (!queue) {
        return res.status(404).json({ message: 'Queue not found' });
      }

      if (queue.account.id !== account.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      handleGenericErrorResponse(res, err);
    }
  };
};

class QueueController {
  private static queueService = new QueueService();

  static async getAllPrivate(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const account = req.user!;
        const queues = await QueueController.queueService.getAllPrivate(account.id, { relations: ['medium'] });
        res.status(200).json(queues);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    }, { skipMembershipStatus: true });
  }

  static async updateIsActiveQueue(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      verifyQueueOwnership()(req, res, async () => {
        validateParamsObject(queueIdTextParamsSchema, req, res, async () => {
          validateBodyObject(updateIsActiveQueueSchema, req, res, async () => {
            const account = req.user!;
            const { queue_id_text } = req.params;
            const { is_active_queue } = req.body;
      
            if (typeof is_active_queue !== 'boolean') {
              return res.status(400).json({ message: 'Invalid is_active_queue value' });
            }
      
            try {
              await QueueController.queueService.updateIsActiveQueue(account.id, queue_id_text, is_active_queue);
              res.status(200).json({ message: 'Queue updated successfully' });
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    }, { skipMembershipStatus: true });
  }
}

export { QueueController };
