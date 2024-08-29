import { AppDataSource } from "@orm/db";
import { FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";

export class BaseManyService<T extends ObjectLiteral, K extends keyof T> {
  protected repository: Repository<T>;
  private key: K;

  constructor(entity: { new (): T }, key: K) {
    this.repository = AppDataSource.getRepository(entity) as Repository<T>;
    this.key = key;
  }

  async getAll(value: T[K]): Promise<T[]> {
    const where: FindOptionsWhere<T> = { [this.key]: value } as FindOptionsWhere<T>;
    return this.repository.find({ where });
  }

  // TODO: add get

  // TODO: add update

  // TODO: add updateMany

  async deleteAll(value: T[K]): Promise<void> {
    const rowsToDelete = await this.getAll(value);
    if (rowsToDelete) {
      await this.repository.remove(rowsToDelete);
    }
  }
}
