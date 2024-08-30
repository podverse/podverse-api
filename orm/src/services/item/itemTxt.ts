import { Item } from '@orm/entities/item/item';
import { ItemTxt } from '@orm/entities/item/itemTxt';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemTxtDto = {
  purpose: string | null
  value: string
}

export class ItemTxtService extends BaseManyService<ItemTxt, 'item'> {
  constructor() {
    super(ItemTxt, 'item');
  }

  async update(channel: Item, dto: ItemTxtDto): Promise<ItemTxt> {
    const whereKeys = ['value'] as (keyof ItemTxt)[];
    return super._update(channel, whereKeys, dto);
  }

  async updateMany(channel: Item, dtos: ItemTxtDto[]): Promise<ItemTxt[]> {
    const whereKeys = ['value'] as (keyof ItemTxt)[];
    return super._updateMany(channel, whereKeys, dtos);
  }
}
