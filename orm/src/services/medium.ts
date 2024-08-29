import { AppDataSource } from '@orm/db';
import { Medium } from '@orm/entities/medium';

export class MediumService {
  private mediumRepository = AppDataSource.getRepository(Medium);

  async mediumGetAll(): Promise<Medium[]> {
    return await this.mediumRepository.find();
  }
}
