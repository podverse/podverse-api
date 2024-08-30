import { Item } from '@orm/entities/item/item';
import { ItemTranscript } from '@orm/entities/item/itemTranscript';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemTranscriptDto = {
  url: string
  title?: string | null
}

export class ItemTranscriptService extends BaseManyService<ItemTranscript, 'item'> {
  constructor() {
    super(ItemTranscript, 'item');
  }

  async update(item: Item, dto: ItemTranscriptDto): Promise<ItemTranscript> {
    const whereKeys = ['url'] as (keyof ItemTranscript)[];
    return super._update(item, whereKeys, dto);
  }

  async updateMany(item: Item, dtos: ItemTranscriptDto[]): Promise<ItemTranscript[]> {
    const whereKeys = ['url'] as (keyof ItemTranscript)[];
    return super._updateMany(item, whereKeys, dtos);
  }
}
