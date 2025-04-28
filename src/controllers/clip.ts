import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { SharableStatusEnum } from 'podverse-helpers';
import { ClipService } from 'podverse-orm';
import { ensureAuthenticated, optionalEnsureAuthenticated } from '@api/lib/auth';
import { handleGenericErrorResponse } from './helpers/error';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';

const clipCreateSchema = Joi.object({
  start_time: Joi.number().min(0).required(),
  end_time: Joi.number().greater(0).allow(null, ''),
  title: Joi.string().allow(null, ''),
  description: Joi.string().allow(null, ''),
  item_id_text: Joi.string().required(),
  sharable_status: Joi.number().min(1).required(),
});

const clipUpdateSchema = Joi.object({
  start_time: Joi.number().min(0).required(),
  end_time: Joi.number().greater(0).allow(null, ''),
  title: Joi.string().allow(null, ''),
  description: Joi.string().allow(null, ''),
  sharable_status: Joi.number().min(1).required(),
});

const clipIdSchema = Joi.object({
  clip_id_text: Joi.string().required(),
});

const clipService = new ClipService();

const verifyClipOwnership = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const account = req.user!;
    const { clip_id_text } = req.params;

    try {
      const clip = await clipService.getByIdText(clip_id_text, { relations: ['account'] });
      if (!clip) {
        return res.status(404).json({ message: 'Clip not found' });
      }

      if (clip.account.id !== account.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      handleGenericErrorResponse(res, err);
    }
  };
};

const verifyPrivateClipOwnership = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const account = req.user;
    const { clip_id_text } = req.params;

    try {
      const clip = await clipService.getByIdText(clip_id_text, {
        relations: ['account', 'sharable_status'],
      });

      if (!clip) {
        return res.status(404).json({ message: 'Clip not found' });
      }

      if (clip.sharable_status.id === SharableStatusEnum.Private) {
        if (!account?.id || clip.account.id !== account.id) {
          return res.status(404).json({ message: 'Clip not found' });
        }
      }

      next();
    } catch (err) {
      handleGenericErrorResponse(res, err);
    }
  };
};

class ClipController {
  static async createClip(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(clipCreateSchema, req, res, async () => {
        const account = req.user!;
        const dto = req.body;

        try {
          const clip = await clipService.create(account.id, dto);
          res.status(201).json(clip);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async updateClip(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateParamsObject(clipIdSchema, req, res, () => {
        verifyClipOwnership()(req, res, () => {
          validateBodyObject(clipUpdateSchema, req, res, async () => {
            const account = req.user!;
            const { clip_id_text } = req.params;
            const dto = req.body;

            try {
              const clip = await clipService.update(account.id, clip_id_text, dto);
              res.status(200).json(clip);
            } catch (err) {
              handleGenericErrorResponse(res, err);
            }
          });
        });
      });
    });
  }

  static async deleteClip(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateParamsObject(clipIdSchema, req, res, () => {
        verifyClipOwnership()(req, res, async () => {
          const account = req.user!;
          const { clip_id_text } = req.params;

          try {
            await clipService.delete(account.id, clip_id_text);
            res.status(204).end();
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getClipById(req: Request, res: Response): Promise<void> {
    validateParamsObject(clipIdSchema, req, res, () => {
      optionalEnsureAuthenticated(req, res, () => {
        verifyPrivateClipOwnership()(req, res, async () => {
          try {
            const { clip_id_text } = req.params;
            const clip = await clipService.getByIdText(clip_id_text);
            if (clip) {
              res.status(200).json(clip);
            } else {
              res.status(404).json({ message: 'Clip not found' });
            }
          } catch (err) {
            handleGenericErrorResponse(res, err);
          }
        });
      });
    });
  }

  static async getClipsPublic(req: Request, res: Response): Promise<void> {
    try {
      const clips = await clipService.getMany({
        where: { sharable_status: { id: SharableStatusEnum.Public } },
        relations: ['sharable_status']
      });
      res.status(200).json(clips);
    } catch (err) {
      handleGenericErrorResponse(res, err);
    }
  }

  static async getClipsPrivate(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const account = req.user!;
        const clips = await clipService.getManyByAccount(account.id);
        res.status(200).json(clips);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }
}

export { ClipController };
