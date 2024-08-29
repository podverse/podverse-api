import { AppDataSource } from "@orm/db";
import { FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import { applyProperties } from "@orm/lib/applyProperties";

export class BaseOneService<T extends ObjectLiteral, K extends keyof T> {
  protected repository: Repository<T>;
  private key: K;

  constructor(entity: { new (): T }, key: K) {
    this.repository = AppDataSource.getRepository(entity) as Repository<T>;
    this.key = key;
  }

  async _get(value: T[K]): Promise<T | null> {
    const where: FindOptionsWhere<T> = { [this.key]: value } as FindOptionsWhere<T>;
    return this.repository.findOne({ where });
  }

  async _update(value: T[K], dto: Partial<T>): Promise<T> {
    let entity = await this._get(value);

    if (!entity) {
      entity = new (this.repository.target as { new (): T })();
      entity[this.key] = value;
    }

    entity = applyProperties(entity, dto);

    return this.repository.save(entity);
  }

  async _delete(value: T[K]): Promise<void> {
    const rowToDelete = await this._get(value);
    if (rowToDelete) {
      await this.repository.remove(rowToDelete);
    }
  }
}
