import { FindOneOptions, FindOptionsWhere, ObjectLiteral } from "typeorm";
import { BaseManyService } from "@orm/services/base/baseManyService";

export class BaseRemoteItemsService<T extends ObjectLiteral, K extends keyof T> extends BaseManyService<T, K> {
  async getAll(parentEntity: T[K]): Promise<T[]> {
    const where: FindOptionsWhere<T> = { [this.parentEntityKey]: parentEntity } as FindOptionsWhere<T>;
    return this.repository.find({ where });
  }

  async getByItemGuid(parentEntity: T[K], item_guid: keyof T): Promise<T | null> {
    const where: FindOptionsWhere<T> = {
      [this.parentEntityKey]: parentEntity,
      item_guid
    } as unknown as FindOptionsWhere<T>;
    return this.repository.findOne({ where });
  }

  async getByFeedGuid(parentEntity: T[K], feed_guid: keyof T): Promise<T | null> {
    const where: FindOptionsWhere<T> = {
      [this.parentEntityKey]: parentEntity,
      feed_guid
    } as unknown as FindOptionsWhere<T>;
    return this.repository.findOne({ where });
  }

  async getByFeedUrl(parentEntity: T[K], feed_url: keyof T): Promise<T | null> {
    const where: FindOptionsWhere<T> = {
      [this.parentEntityKey]: parentEntity,
      feed_url
    } as unknown as FindOptionsWhere<T>;
    return this.repository.findOne({ where });
  }

  async get(parentEntity: T[K], dto: Partial<T>): Promise<T | null> {
    if (dto.item_guid) {
      return this.getByItemGuid(parentEntity, dto.item_guid);
    } else if (dto.feed_guid) {
      return this.getByFeedGuid(parentEntity, dto.feed_guid);
    } else if (dto.feed_url) {
      return this.getByFeedUrl(parentEntity, dto.feed_url);
    }

    return null;
  }

  async update(parentEntity: T[K], dto: Partial<T>, config?: FindOneOptions<T>): Promise<T> {
    const whereKeys = ['feed_guid', 'feed_url', 'item_guid'] as (keyof T)[];
    return super._update(parentEntity, whereKeys, dto, config);
  }

  async updateMany(parentEntity: T[K], dtos: Partial<T>[], config?: FindOneOptions<T>): Promise<T[]> {
    const whereKeys = ['feed_guid', 'feed_url', 'item_guid'] as (keyof T)[];
    return super._updateMany(parentEntity, whereKeys, dtos, config);
  }
}
