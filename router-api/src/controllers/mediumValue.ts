import { Request, Response } from 'express';
import { MediumValueService } from '@orm/services/mediumValue';

const mediumValueService = new MediumValueService();

export class MediumValueController {
  static async mediumValuesGetAll(req: Request, res: Response): Promise<void> {
    const result = await mediumValueService.mediumValueGetAll();
    res.json(result);
  }
}
