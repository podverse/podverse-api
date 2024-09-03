import { EntityManager } from 'typeorm';
import { ItemValue } from '@orm/entities/item/itemValue';
import { ItemValueTimeSplit } from '@orm/entities/item/itemValueTimeSplit';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemValueTimeSplitDto = {
  start_time: string
  duration: string
  remote_start_time: string
  remote_percentage: string
}

export class ItemValueTimeSplitService extends BaseManyService<ItemValueTimeSplit, 'item_value'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ItemValueTimeSplit, 'item_value', transactionalEntityManager);
  }

  async update(item_value: ItemValue, dto: ItemValueTimeSplitDto): Promise<ItemValueTimeSplit> {
    const whereKeys = ['start_time', 'duration'] as (keyof ItemValueTimeSplit)[];
    return super._update(item_value, whereKeys, dto);
  }

  async updateMany(item: ItemValue, dtos: ItemValueTimeSplitDto[]): Promise<ItemValueTimeSplit[]> {
    const whereKeys = ['start_time', 'duration'] as (keyof ItemValueTimeSplit)[];
    return super._updateMany(item, whereKeys, dtos);
  }
}
