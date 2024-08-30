import { Item } from '@orm/entities/item/item';
import { ItemLocation } from '@orm/entities/item/itemLocation';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ItemLocationDto = {
  geo: string | null
  osm: string | null
  name: string | null
}

export class ItemLocationService extends BaseOneService<ItemLocation, 'item'> {
  constructor() {
    super(ItemLocation, 'item');
  }

  async update(item: Item, dto: ItemLocationDto): Promise<ItemLocation> {
    return super._update(item, dto);
  }
}
