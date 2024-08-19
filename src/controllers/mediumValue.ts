import { Request, Response } from 'express';
import { MediumValueService } from '@/services/mediumValue';

const mediumValueService = new MediumValueService();

export class MediumValueController {
  static async getAllMediumValues(req: Request, res: Response): Promise<void> {
    const result = await mediumValueService.mediumValueGetAll();
    res.json(result);
  }
}
