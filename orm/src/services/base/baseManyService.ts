import { FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import { AppDataSource } from "@orm/db";
import { applyProperties } from "@orm/lib/applyProperties";
import { hasDifferentValues } from "@orm/lib/hasDifferentValues";

export class BaseManyService<T extends ObjectLiteral, K extends keyof T> {
  protected repository: Repository<T>;
  protected parentEntityKey: K;
  protected targetEntity: { new (): T };

  constructor(targetEntity: { new (): T }, parentEntityKey: K) {
    this.targetEntity = targetEntity;
    this.repository = AppDataSource.getRepository(targetEntity) as Repository<T>;
    this.parentEntityKey = parentEntityKey;
  }

  async _getAll(parentEntity: T[K]): Promise<T[]> {
    const where: FindOptionsWhere<T> = { [this.parentEntityKey]: parentEntity } as FindOptionsWhere<T>;
    return this.repository.find({ where });
  }

  async _get(parentEntity: T[K], whereKeyValues: Record<string,unknown>, config?: FindOneOptions<T>): Promise<T | null> {
    const where: FindOptionsWhere<T> = {
      [this.parentEntityKey]: parentEntity,
      ...whereKeyValues
    } as FindOptionsWhere<T>;
    return this.repository.findOne({ where, ...config });
  }

  async _update(parentEntity: T[K], whereKeys: (keyof T)[], dto: Partial<T>, config?: FindOneOptions<T>) : Promise<T> {
    const whereObject: Partial<T> = {};
    whereKeys.forEach(key => {
      if (key in dto) {
        whereObject[key as keyof T] = dto[key];
      }
    });

    let entity = await this._get(parentEntity, whereObject, config);

    if (!entity) {
      entity = new this.targetEntity();
      entity[this.parentEntityKey] = parentEntity;
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

  async _updateMany(parentEntity: T[K], whereKeys: (keyof T)[], dtos: Partial<T>[], config?: FindOneOptions<T>): Promise<T[]> {
    const existingEntities = await this._getAll(parentEntity);
    const existingIdentifiers = dtos.map((dto: Partial<T>) => {
      let identifier: Partial<T> = {}
      for (const whereKey of whereKeys) {
        identifier[whereKey] = dto[whereKey];
      }
      return identifier;
    });
    
    const updatedEntities: T[] = [];
    for (const dto of dtos) {
      const updatedEntity = await this._update(parentEntity, whereKeys, dto, config);
      updatedEntities.push(updatedEntity);
    }
    
    await this.repository.save(updatedEntities);
  
    const entitiesToDelete = existingEntities.filter(existingEntity => {
      let identifier: Partial<T> = {}
      for (const whereKey of whereKeys) {
        identifier[whereKey] = existingEntity[whereKey];
      }
      return !existingIdentifiers.some(existingIdentifier => JSON.stringify(existingIdentifier) === JSON.stringify(identifier));
    });
    if (entitiesToDelete.length > 0) {
      await this.repository.remove(entitiesToDelete);
    }
  
    return updatedEntities;
  }

  async _deleteAll(value: T[K]): Promise<void> {
    const rowsToDelete = await this._getAll(value);
    if (rowsToDelete) {
      await this.repository.remove(rowsToDelete);
    }
  }
}
