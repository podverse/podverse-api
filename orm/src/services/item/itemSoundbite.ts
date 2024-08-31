import { Item } from '@orm/entities/item/item';
import { ItemSoundbite } from '@orm/entities/item/itemSoundbite';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemSoundbiteDto = {
  start_time: string
  duration: string
  title: string | null
}

export class ItemSoundbiteService extends BaseManyService<ItemSoundbite, 'item'> {
  constructor() {
    super(ItemSoundbite, 'item');
  }

  async _getByIdText(id_text: string): Promise<ItemSoundbite | null> {
    return this.repository.findOne({ where: { id_text } });
  }

  async update(item: Item, dto: ItemSoundbiteDto): Promise<ItemSoundbite> {
    const whereKeys = ['start_time', 'duration'] as (keyof ItemSoundbite)[];
    return super._update(item, whereKeys, dto);
  }

  async updateMany(item: Item, dtos: ItemSoundbiteDto[]): Promise<ItemSoundbite[]> {
    const whereKeys = ['start_time', 'duration'] as (keyof ItemSoundbite)[];
    return super._updateMany(item, whereKeys, dtos);
  }
}
