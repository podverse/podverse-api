import { EntityManager, FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import logger from "@helpers/lib/logs/logger";
import { AppDataSource } from "@orm/db";
import { applyProperties } from "@orm/lib/applyProperties";
import { hasDifferentValues } from "@orm/lib/hasDifferentValues";

export class BaseOneService<T extends ObjectLiteral, K extends keyof T> {
  private parentEntityKey: K;
  protected repository: Repository<T>;
  private transactionalEntityManager?: EntityManager;

  constructor(entity: { new (): T }, parentEntityKey: K, transactionalEntityManager?: EntityManager) {
    this.parentEntityKey = parentEntityKey;
    this.repository = AppDataSource.getRepository(entity) as Repository<T>;
    this.transactionalEntityManager = transactionalEntityManager;
  }

  async _get(parentEntity: T[K], config?: FindOneOptions<T>): Promise<T | null> {
    const where: FindOptionsWhere<T> = { [this.parentEntityKey]: parentEntity } as FindOptionsWhere<T>;
    return this.repository.findOne({ where, ...config });
  }

  async _update(parentEntity: T[K], dto: Partial<T>, config?: FindOneOptions<T>): Promise<T> {
    let entity = await this._get(parentEntity, config);

    if (!entity) {
      entity = new (this.repository.target as { new (): T })();
      entity[this.parentEntityKey] = parentEntity;
    } else if (!hasDifferentValues(entity, dto)) {
      return entity;
    }

    entity = applyProperties(entity, dto);
    logger.debug(`Updating entity ${JSON.stringify(entity)}`);
    logger.debug(`With DTO ${JSON.stringify(dto)}`);

    return (this.transactionalEntityManager as EntityManager
      ?? this.repository).save(entity);
  }

  async _delete(parentEntity: T[K]): Promise<void> {
    const rowToDelete = await this._get(parentEntity);
    if (rowToDelete) {
      await this.repository.remove(rowToDelete);
    }
  }
}
