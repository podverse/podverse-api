import { ItemChaptersFeed } from '@orm/entities/item/itemChaptersFeed';
import { ItemChaptersFeedLog } from '@orm/entities/item/itemChaptersFeedLog';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ItemChaptersFeedLogDto = {
  last_http_status?: number | null
  last_good_http_status_time?: Date | null
  last_finished_parse_time?: Date | null
  parse_errors?: number
}

export class ItemChaptersFeedLogService extends BaseOneService<ItemChaptersFeedLog, 'itemChaptersFeed'> {
  constructor() {
    super(ItemChaptersFeedLog, 'itemChaptersFeed');
  }

  async update(itemChaptersFeed: ItemChaptersFeed, dto: ItemChaptersFeedLogDto): Promise<ItemChaptersFeedLog> {
    return super._update(itemChaptersFeed, dto);
  }
}
