import { EntityManager } from 'typeorm';
import { ItemValueTimeSplit } from '@orm/entities/item/itemValueTimeSplit';
import { ItemValueTimeSplitRecipient } from '@orm/entities/item/itemValueTimeSplitRecipient';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemValueTimeSplitRecipientDto = {
  type: string
  address: string
  split: number
  name: string | null
  custom_key: string | null
  custom_value: string | null
  fee: boolean
}

export class ItemValueTimeSplitRecipientService extends BaseManyService<ItemValueTimeSplitRecipient, 'item_value_time_split'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ItemValueTimeSplitRecipient, 'item_value_time_split', transactionalEntityManager);
  }

  async update(item_value_time_split: ItemValueTimeSplit, dto: ItemValueTimeSplitRecipientDto): Promise<ItemValueTimeSplitRecipient> {
    const whereKeys = ['type', 'address', 'custom_key', 'custom_value'] as (keyof ItemValueTimeSplitRecipient)[];
    return super._update(item_value_time_split, whereKeys, dto);
  }

  async updateMany(item_value_time_split: ItemValueTimeSplit, dtos: ItemValueTimeSplitRecipientDto[]): Promise<ItemValueTimeSplitRecipient[]> {
    const whereKeys = ['type', 'address', 'custom_key', 'custom_value'] as (keyof ItemValueTimeSplitRecipient)[];
    return super._updateMany(item_value_time_split, whereKeys, dtos);
  }
}
