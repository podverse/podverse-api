import { Request, Response } from 'express';
import Joi from 'joi';
import { CategoryService } from 'podverse-orm';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { validateParamsObject } from '@api/lib/validation';
import { getParamRequired } from '@api/lib/params';

const getCategorySchema = Joi.object({
  id: Joi.number().integer().min(1).required()
});

export class CategoryController {
  private static categoryService = new CategoryService();

  static async get(req: Request, res: Response): Promise<void> {
    validateParamsObject(getCategorySchema, req, res, async () => {
      try {
        const id = getParamRequired(req, 'id');
        const numericId = parseInt(id, 10);
        const data = await CategoryController.categoryService.get(numericId);
        handleReturnDataOrNotFound(res, data, 'Category');
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categories = await CategoryController.categoryService.getAll();
      res.json({ data: categories });
    } catch (error) {
      handleGenericErrorResponse(res, error);
    }
  }
}
