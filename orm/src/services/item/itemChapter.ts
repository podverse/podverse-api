import { ItemChapter } from '@orm/entities/item/itemChapter';
import { ItemChaptersFeed } from '@orm/entities/item/itemChaptersFeed';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemChapterDto = {
  start_time: string
  end_time: string | null
  title: string | null
  web_url: string | null
  table_of_contents: boolean
}

export class ItemChapterService extends BaseManyService<ItemChapter, 'item_chapters_feed'> {
  constructor() {
    super(ItemChapter, 'item_chapters_feed');
  }

  async update(item_chapters_feed: ItemChaptersFeed, dto: ItemChapterDto): Promise<ItemChapter> {    
    const whereKeys = ['start_time', 'end_time', 'table_of_contents'] as (keyof ItemChapter)[];
    return super._update(item_chapters_feed, whereKeys, dto);
  }

  async updateMany(item_chapters_feed: ItemChaptersFeed, dtos: ItemChapterDto[]): Promise<ItemChapter[]> {
    const whereKeys = ['start_time', 'end_time', 'table_of_contents'] as (keyof ItemChapter)[];
    return super._updateMany(item_chapters_feed, whereKeys, dtos);
  }
}
