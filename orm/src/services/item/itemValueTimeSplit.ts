import { ItemValue } from '@orm/entities/item/itemValue';
import { ItemValueTimeSplit } from '@orm/entities/item/itemValueTimeSplit';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemValueTimeSplitDto = {
  start_time: number
  duration: number
  remote_start_time: number
  remote_percentage: number
}

export class ItemValueTimeSplitService extends BaseManyService<ItemValueTimeSplit, 'item_value'> {
  constructor() {
    super(ItemValueTimeSplit, 'item_value');
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
