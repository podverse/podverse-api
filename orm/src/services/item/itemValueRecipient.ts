import { EntityManager } from 'typeorm';
import { ItemValue } from '@orm/entities/item/itemValue';
import { ItemValueRecipient } from '@orm/entities/item/itemValueRecipient';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemValueRecipientDto = {
  type: string
  address: string
  split: number
  name: string | null
  custom_key: string | null
  custom_value: string | null
  fee: boolean
}

export class ItemValueRecipientService extends BaseManyService<ItemValueRecipient, 'item_value'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ItemValueRecipient, 'item_value', transactionalEntityManager);
  }

  async update(item_value: ItemValue, dto: ItemValueRecipientDto): Promise<ItemValueRecipient> {
    const whereKeys = ['type', 'address', 'custom_key', 'custom_value'] as (keyof ItemValueRecipient)[];
    return super._update(item_value, whereKeys, dto);
  }

  async updateMany(item_value: ItemValue, dtos: ItemValueRecipientDto[]): Promise<ItemValueRecipient[]> {
    const whereKeys = ['type', 'address', 'custom_key', 'custom_value'] as (keyof ItemValueRecipient)[];
    return super._updateMany(item_value, whereKeys, dtos);
  }
}
