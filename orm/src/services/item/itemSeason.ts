import { Item } from '@orm/entities/item/item';
import { ItemSeason } from '@orm/entities/item/itemSeason';
import { BaseOneService } from '../base/baseOneService';

type ItemSeasonDto = {
  title: string
}

export class ItemSeasonService extends BaseOneService<ItemSeason, 'item'> {
  constructor() {
    super(ItemSeason, 'item');
  }

  async update(item: Item, dto: ItemSeasonDto): Promise<ItemSeason> {
    // TODO: pass in an index for matching the channelseason number
    return super._update(item, dto);
  }
}
