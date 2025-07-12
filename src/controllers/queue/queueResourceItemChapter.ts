import { Request, Response } from 'express';
import { QueueResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';
import { verifyQueueOwnership } from '@api/controllers/queue/queue';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';
import Joi from 'joi';

const addItemChapterToQueueBetweenSchema = Joi.object({
  position1: Joi.number().min(0).required(),
  position2: Joi.number().min(Joi.ref('position1')).required()
}).with('position1', 'position2');

const queueAndChapterIdSchema = Joi.object({
  queue_id_text: Joi.string().required(),
  item_chapter_id_text: Joi.string().required()
});

class QueueResourceItemChapterController {
  private static queueResourceService = new QueueResourceService();

  static async addItemChapterToQueueNext(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndChapterIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text, item_chapter_id_text } = req.params;

          try {
            const queueResource = await QueueResourceItemChapterController.queueResourceService.addItemChapterToQueueNext(queue_id_text, item_chapter_id_text);
            res.status(201).json(queueResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addItemChapterToQueueLast(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndChapterIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text, item_chapter_id_text } = req.params;

          try {
            const queueResource = await QueueResourceItemChapterController.queueResourceService.addItemChapterToQueueLast(queue_id_text, item_chapter_id_text);
            res.status(201).json(queueResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addItemChapterToQueueBetween(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndChapterIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        validateBodyObject(addItemChapterToQueueBetweenSchema, req, res, async () => {
          verifyQueueOwnership()(req, res, async () => {
            const { queue_id_text, item_chapter_id_text } = req.params;
            const { position1, position2 } = req.body;

            try {
              const queueResource = await QueueResourceItemChapterController.queueResourceService.addItemChapterToQueueBetween(queue_id_text, item_chapter_id_text, position1, position2);
              res.status(201).json(queueResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async addItemChapterToNowPlaying(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndChapterIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text, item_chapter_id_text } = req.params;

          try {
            const queueResource = await QueueResourceItemChapterController.queueResourceService.addItemChapterToNowPlaying(queue_id_text, item_chapter_id_text);
            res.status(201).json(queueResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async addItemChapterToHistory(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndChapterIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text, item_chapter_id_text } = req.params;

          try {
            const queueResource = await QueueResourceItemChapterController.queueResourceService.addItemChapterToHistory(queue_id_text, item_chapter_id_text);
            res.status(201).json(queueResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async removeItemChapterFromQueue(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndChapterIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text, item_chapter_id_text } = req.params;

          try {
            await QueueResourceItemChapterController.queueResourceService.removeItemChapterFromQueue(queue_id_text, item_chapter_id_text);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }
}

export { QueueResourceItemChapterController };