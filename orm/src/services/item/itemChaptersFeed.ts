import { Item } from '@orm/entities/item/item';
import { ItemChaptersFeed } from '@orm/entities/item/itemChaptersFeed';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ItemChaptersFeedDto = {
  url: string
  type: string
}

export class ItemChaptersFeedService extends BaseOneService<ItemChaptersFeed, 'item'> {
  constructor() {
    super(ItemChaptersFeed, 'item');
  }

  async update(item: Item, dto: ItemChaptersFeedDto): Promise<ItemChaptersFeed> {
    return super._update(item, dto);
  }
}
