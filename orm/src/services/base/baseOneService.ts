import { FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import { AppDataSource } from "@orm/db";
import { applyProperties } from "@orm/lib/applyProperties";
import { hasDifferentValues } from "@orm/lib/hasDifferentValues";

export class BaseOneService<T extends ObjectLiteral, K extends keyof T> {
  protected repository: Repository<T>;
  private key: K;

  constructor(entity: { new (): T }, key: K) {
    this.repository = AppDataSource.getRepository(entity) as Repository<T>;
    this.key = key;
  }

  async _get(parentEntity: T[K], config?: FindOneOptions<T>): Promise<T | null> {
    const where: FindOptionsWhere<T> = { [this.key]: parentEntity } as FindOptionsWhere<T>;
    return this.repository.findOne({ where, ...config });
  }

  async _update(parentEntity: T[K], dto: Partial<T>, config?: FindOneOptions<T>): Promise<T> {
    let entity = await this._get(parentEntity, config);

    if (!entity) {
      entity = new (this.repository.target as { new (): T })();
      entity[this.key] = parentEntity;
    } else if (!hasDifferentValues(entity, dto)) {
      return entity;
    }

    console.log('not skipping entity...', entity)
    console.log('not skipping dto...', dto)
    entity = applyProperties(entity, dto);
    console.log('Updating parent entity', parentEntity);
    console.log('Updating entity', entity);
    console.log('With DTO', dto);
    console.log('SAVE THIS', entity)

    return this.repository.save(entity);
  }

  async _delete(parentEntity: T[K]): Promise<void> {
    const rowToDelete = await this._get(parentEntity);
    if (rowToDelete) {
      await this.repository.remove(rowToDelete);
    }
  }
}
