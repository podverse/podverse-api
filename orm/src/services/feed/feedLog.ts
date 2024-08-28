import { AppDataSource } from '@orm/db';
import { Feed } from '@orm/entities/feed/feed';
import { FeedLog } from '@orm/entities/feed/feedLog';

type FeedLogCreateOrUpdateDto = {
  feed: Feed
}

export class FeedLogService {
  private repository = AppDataSource.getRepository(FeedLog);

  async get(feed_id: number): Promise<FeedLog | null> {
    return await this.repository.findOne({
      where: { feed: { id: feed_id } },
    });
  }

  async update({ feed }: FeedLogCreateOrUpdateDto): Promise<FeedLog> {
    let feed_log: FeedLog | null = feed.feed_log
    if (!feed_log) {
      feed_log = new FeedLog();
      feed_log.feed = feed;
    }
    return await this.repository.save(feed_log);
  }
}
