import { Feed } from '@orm/entities/feed/feed';
import { FeedLog } from '@orm/entities/feed/feedLog';
import { BaseOneService } from '@orm/services/base/baseOneService';

type FeedLogDto = {
  last_http_status?: number | null
  last_good_http_status_time?: Date | null
  last_finished_parse_time?: Date | null
  parse_errors?: number
}

export class FeedLogService extends BaseOneService<FeedLog, 'feed'> {
  constructor() {
    super(FeedLog, 'feed');
  }

  async update(feed: Feed, dto: FeedLogDto): Promise<FeedLog> {
    return super._update(feed, dto);
  }
}
