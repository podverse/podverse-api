import { Request, Response } from 'express';
import Joi from 'joi';
import { QueueResourceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';
import { verifyQueueOwnership } from '@api/controllers/queue/queue';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';

const addItemToQueueBetweenSchema = Joi.object({
  position1: Joi.number().min(0).required(),
  position2: Joi.number().min(Joi.ref('position1')).required()
}).with('position1', 'position2');

const queueAndItemIdSchema = Joi.object({
  queue_id_text: Joi.string().required(),
  item_id_text: Joi.string().required()
});

export const queueResourceNowPlayingSchema = Joi.object({
  playback_position: Joi.number().min(0).optional(),
  media_file_duration: Joi.number().min(0).optional(),
  completed: Joi.boolean().optional()
}).required();

class QueueResourceItemController {
  private static queueResourceService = new QueueResourceService();

  static async addItemToNowPlaying(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndItemIdSchema, req, res, async () => {
      validateBodyObject(queueResourceNowPlayingSchema, req, res, async () => {
        ensureAuthenticated(req, res, async () => {
          verifyQueueOwnership()(req, res, async () => {
            const { queue_id_text, item_id_text } = req.params;
  
            const { playback_position, media_file_duration, completed } = req.body;
  
            const dto = {
              ...((playback_position || playback_position === 0) ? { playback_position } : {}),
              ...((media_file_duration || media_file_duration === 0) ? { media_file_duration } : {}),
              ...(completed ? { completed } : {})
            };
  
            try {
              const queueResource = await QueueResourceItemController.queueResourceService.addItemToNowPlaying(queue_id_text, item_id_text, dto);
              res.status(201).json(queueResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        }, { skipMembershipStatus: false });
      });
    });
  }

  static async addItemToQueueNext(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndItemIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text, item_id_text } = req.params;

          try {
            const queueResource = await QueueResourceItemController.queueResourceService.addItemToQueueNext(queue_id_text, item_id_text);
            res.status(201).json(queueResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      }, { skipMembershipStatus: false });
    });
  }

  static async addItemToQueueLast(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndItemIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text, item_id_text } = req.params;

          try {
            const queueResource = await QueueResourceItemController.queueResourceService.addItemToQueueLast(queue_id_text, item_id_text);
            res.status(201).json(queueResource);
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      }, { skipMembershipStatus: false });
    });
  }

  static async addItemToQueueBetween(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndItemIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        validateBodyObject(addItemToQueueBetweenSchema, req, res, async () => {
          verifyQueueOwnership()(req, res, async () => {
            const { queue_id_text, item_id_text } = req.params;
            const { position1, position2 } = req.body;

            try {
              const queueResource = await QueueResourceItemController.queueResourceService.addItemToQueueBetween(queue_id_text, item_id_text, position1, position2);
              res.status(201).json(queueResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      }, { skipMembershipStatus: false });
    });
  }

  static async addItemToHistory(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndItemIdSchema, req, res, async () => {
      validateBodyObject(queueResourceNowPlayingSchema, req, res, async () => {
        ensureAuthenticated(req, res, async () => {
          verifyQueueOwnership()(req, res, async () => {
            const { queue_id_text, item_id_text } = req.params;
            const { playback_position, media_file_duration, completed } = req.body;

            const dto = {
              ...((playback_position || playback_position === 0) ? { playback_position } : {}),
              ...((media_file_duration || media_file_duration === 0) ? { media_file_duration } : {}),
              ...(completed ? { completed } : {})
            };
  
            try {
              const queueResource = await QueueResourceItemController
                .queueResourceService
                .addItemToHistory(queue_id_text, item_id_text, dto);
              res.status(201).json(queueResource);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        }, { skipMembershipStatus: false });
      });
    });
  }

  static async removeItemFromQueue(req: Request, res: Response): Promise<void> {
    validateParamsObject(queueAndItemIdSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        verifyQueueOwnership()(req, res, async () => {
          const { queue_id_text, item_id_text } = req.params;

          try {
            await QueueResourceItemController.queueResourceService.removeItemFromQueue(queue_id_text, item_id_text);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      }, { skipMembershipStatus: true });
    });
  }
}

export { QueueResourceItemController };