import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { QueueService } from 'podverse-orm';
import { ensureAuthenticated } from '@api/lib/auth';
import { handleGenericErrorResponse } from '../helpers/error';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';

const queueSchema = Joi.object({
  medium: Joi.number().min(1).required()
});

const queueIdSchema = Joi.object({
  queue_id_text: Joi.string().required()
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

  static async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(queueSchema, req, res, async () => {
        const account = req.user!;
        const dto = req.body;

        try {
          const queue = await QueueController.queueService.create(account.id, dto);
          res.status(201).json(queue);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async delete(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateParamsObject(queueIdSchema, req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const account = req.user!;
          const { queue_id_text } = req.params;

          try {
            await QueueController.queueService.delete(account.id, queue_id_text);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getAllPrivate(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const account = req.user!;
        const queues = await QueueController.queueService.getAllPrivate(account.id, { relations: ['medium'] });
        res.status(200).json(queues);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }
}

export { QueueController };
