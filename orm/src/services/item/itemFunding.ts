import { Item } from '@orm/entities/item/item';
import { ItemFunding } from '@orm/entities/item/itemFunding';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemFundingDto = {
  url: string
  title: string | null
}

export class ItemFundingService extends BaseManyService<ItemFunding, 'item'> {
  constructor() {
    super(ItemFunding, 'item');
  }

  async update(item: Item, dto: ItemFundingDto): Promise<ItemFunding> {
    const whereKeys = ['url'] as (keyof ItemFunding)[];
    return super._update(item, whereKeys, dto);
  }

  async updateMany(item: Item, dtos: ItemFundingDto[]): Promise<ItemFunding[]> {
    const whereKeys = ['url'] as (keyof ItemFunding)[];
    return super._updateMany(item, whereKeys, dtos);
  }
}
