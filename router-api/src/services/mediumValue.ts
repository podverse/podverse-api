import { AppDataSource } from '@/db';
import { MediumValue } from '@/entities/mediumValue';

export class MediumValueService {
  private mediumValueRepository = AppDataSource.getRepository(MediumValue);

  async mediumValueGetAll(): Promise<MediumValue[]> {
    return await this.mediumValueRepository.find();
  }
}
