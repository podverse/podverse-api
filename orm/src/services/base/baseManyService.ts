import { EntityManager, FindManyOptions, FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import logger from "@helpers/lib/logs/logger";
import { AppDataSource } from "@orm/db";
import { applyProperties } from "@orm/lib/applyProperties";
import { hasDifferentValues } from "@orm/lib/hasDifferentValues";

export class BaseManyService<T extends ObjectLiteral, K extends keyof T> {
  protected repository: Repository<T>;
  protected parentEntityKey: K;
  protected targetEntity: { new (): T };
  private transactionalEntityManager?: EntityManager;

  constructor(targetEntity: { new (): T }, parentEntityKey: K, transactionalEntityManager?: EntityManager) {
    this.targetEntity = targetEntity;
    this.parentEntityKey = parentEntityKey;
    this.repository = AppDataSource.getRepository(targetEntity) as Repository<T>;
    this.transactionalEntityManager = transactionalEntityManager;
  }

  async _getAll(parentEntity: T[K], config?: FindManyOptions<T>): Promise<T[]> {
    const where: FindOptionsWhere<T> = { [this.parentEntityKey]: parentEntity } as FindOptionsWhere<T>;
    return this.repository.find({ where, ...config });
  }

  async _get(parentEntity: T[K], whereKeyValues: Record<string,unknown>, config?: FindOneOptions<T>): Promise<T | null> {
    const where: FindOptionsWhere<T> = {
      [this.parentEntityKey]: parentEntity,
      ...whereKeyValues
    } as FindOptionsWhere<T>;
    return this.repository.findOne({ where, ...config });
  }

  async _update(
    parentEntity: T[K],
    whereKeys: (keyof T)[],
    dto: Partial<T>,
    config?: FindOneOptions<T>,
    existingEntity?: T
  ) : Promise<T> {
    const whereObject: Partial<T> = {};
    whereKeys.forEach(key => {
      if (key in dto) {
        whereObject[key as keyof T] = dto[key];
      }
    });

    let entity: T | null = existingEntity || null
    
    if (!entity) {
      entity = await this._get(parentEntity, whereObject, config);
    }

    if (!entity) {
      entity = new this.targetEntity();
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

  async _updateMany(
    parentEntity: T[K],
    whereKeys: (keyof T)[],
    dtos: Partial<T>[],
    config?: FindOneOptions<T>
  ): Promise<T[]> {
    const existingEntities = await this._getAll(parentEntity);

    const existingIdentifiers = dtos.map((dto: Partial<T>) => {
      let identifier: Partial<T> = {};
      for (const whereKey of whereKeys) {
        identifier[whereKey] = dto[whereKey];
      }
      return identifier;
    });
    
    const updatedEntities: T[] = [];

    // This prevents entries with duplicate unique constraint values
    // from attempting to be saved (which would cause a whole transaction to rollback).
    const uniqueIdentifiers = new Set<string>();
    const uniqueDtos = dtos.filter(dto => {
      const identifier = whereKeys.map(key => dto[key]).join('|');
      if (uniqueIdentifiers.has(identifier)) {
        return false;
      } else {
        uniqueIdentifiers.add(identifier);
        return true;
      }
    });

    for (const uniqueDto of uniqueDtos) {
      const matchingEntity = existingEntities.find(entity => 
        whereKeys.every(key => entity[key] === uniqueDto[key])
      );

      const updatedEntity = await this._update(parentEntity, whereKeys, uniqueDto, config, matchingEntity);
      updatedEntities.push(updatedEntity);
    }
    
    await (this.transactionalEntityManager as EntityManager
      ?? this.repository).save(updatedEntities);
  
    const entitiesToDelete = existingEntities.filter(existingEntity => {
      let identifier: Partial<T> = {};
      for (const whereKey of whereKeys) {
        identifier[whereKey] = existingEntity[whereKey];
      }
      return !existingIdentifiers.some(existingIdentifier => JSON.stringify(existingIdentifier) === JSON.stringify(identifier));
    });

    if (entitiesToDelete.length > 0) {
      await (this.transactionalEntityManager as EntityManager
        ?? this.repository).remove(entitiesToDelete);
    }
  
    return updatedEntities;
  }

  async _deleteAll(value: T[K]): Promise<void> {
    const rowsToDelete = await this._getAll(value);
    if (rowsToDelete) {
      await (this.transactionalEntityManager as EntityManager
        ?? this.repository).remove(rowsToDelete);
    }
  }
}
