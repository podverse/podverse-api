import { Request, Response } from 'express';
import Joi from 'joi';
import { ItemChapterService } from 'podverse-orm';
import { handleGenericErrorResponse } from './helpers/error';
import { validateParamsObject } from '@api/lib/validation';

const itemChapterByIdTextSchema = Joi.object({
  item_chapter_id_text: Joi.string().required(),
});

const itemChapterService = new ItemChapterService();

export class ItemChapterController {

  static async getItemChapterByIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(itemChapterByIdTextSchema, req, res, async () => {
      try {
        const { item_chapter_id_text } = req.params;
        const itemChapter = await itemChapterService.getByIdText(
          item_chapter_id_text,
          { relations: ['item_chapters_feed', 'item_chapters_feed.item'] }
        );
        if (itemChapter) {
          res.status(200).json(itemChapter);
        } else {
          res.status(404).json({ message: 'Item chapter not found' });
        }
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

}
