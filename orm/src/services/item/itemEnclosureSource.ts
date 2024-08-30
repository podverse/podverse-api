import { ItemEnclosure } from '@orm/entities/item/itemEnclosure';
import { ItemEnclosureSource } from '@orm/entities/item/itemEnclosureSource';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemEnclosureDto = {
  uri: string
  content_type: string | null
}

export class ItemEnclosureSourceService extends BaseManyService<ItemEnclosureSource, 'item_enclosure'> {
  constructor() {
    super(ItemEnclosureSource, 'item_enclosure');
  }

  async update(item_enclosure: ItemEnclosure, dto: ItemEnclosureDto): Promise<ItemEnclosureSource> {
    const whereKeys = ['uri'] as (keyof ItemEnclosureSource)[];
    return super._update(item_enclosure, whereKeys, dto);
  }

  async updateMany(item_enclosure: ItemEnclosure, dtos: ItemEnclosureDto[]): Promise<ItemEnclosureSource[]> {
    const whereKeys = ['uri'] as (keyof ItemEnclosureSource)[];
    return super._updateMany(item_enclosure, whereKeys, dtos);
  }
}
