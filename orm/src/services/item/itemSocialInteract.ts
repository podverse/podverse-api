import { Item } from '@orm/entities/item/item';
import { ItemSocialInteract } from '@orm/entities/item/itemSocialInteract';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemSocialInteractDto = {
  protocol: string
  uri: string
  account_id: string | null
  account_url: string | null
  priority: number | null
}

export class ItemSocialInteractService extends BaseManyService<ItemSocialInteract, 'item'> {
  constructor() {
    super(ItemSocialInteract, 'item');
  }

  async update(item: Item, dto: ItemSocialInteractDto): Promise<ItemSocialInteract> {
    const whereKeys = ['uri'] as (keyof ItemSocialInteract)[];
    return super._update(item, whereKeys, dto);
  }

  async updateMany(item: Item, dtos: ItemSocialInteractDto[]): Promise<ItemSocialInteract[]> {
    const whereKeys = ['uri'] as (keyof ItemSocialInteract)[];
    return super._updateMany(item, whereKeys, dtos);
  }
}
