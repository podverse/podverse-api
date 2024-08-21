import { AppDataSource } from '@orm/db';
import { MediumValue } from '@orm/entities/mediumValue';

export class MediumValueService {
  private mediumValueRepository = AppDataSource.getRepository(MediumValue);

  async mediumValueGetAll(): Promise<MediumValue[]> {
    return await this.mediumValueRepository.find();
  }
}
