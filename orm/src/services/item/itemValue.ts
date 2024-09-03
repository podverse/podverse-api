import { EntityManager } from 'typeorm';
import { Item } from '@orm/entities/item/item';
import { ItemValue } from '@orm/entities/item/itemValue';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemValueDto = {
  type: string
  method: string
  suggested: number | null
}

export class ItemValueService extends BaseManyService<ItemValue, 'item'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ItemValue, 'item', transactionalEntityManager);
  }

  async update(item: Item, dto: ItemValueDto): Promise<ItemValue> {
    const whereKeys = ['type', 'method'] as (keyof ItemValue)[];
    return super._update(item, whereKeys, dto);
  }

  async updateMany(item: Item, dtos: ItemValueDto[]): Promise<ItemValue[]> {
    const whereKeys = ['type', 'method'] as (keyof ItemValue)[];
    return super._updateMany(item, whereKeys, dtos);
  }
}
