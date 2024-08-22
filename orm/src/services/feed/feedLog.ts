import { AppDataSource } from '@orm/db';
import { Feed } from '@orm/entities/feed/feed';
import { FeedFlagStatusStatusEnum } from '@orm/entities/feed/feedFlagStatus';
import { FeedLog } from '@orm/entities/feed/feedLog';
import { ChannelService } from '@orm/services/channel/channel';

const channelService = new ChannelService();

type FeedLogCreateOrUpdateDto = {
  feed: Feed
}

export class FeedLogService {
  private feedLogRepository = AppDataSource.getRepository(FeedLog);

  async get(feed_id: number): Promise<FeedLog | null> {
    return await this.feedLogRepository.findOne({
      where: { feed: { id: feed_id } },
    });
  }

  async create({ feed }: FeedLogCreateOrUpdateDto): Promise<FeedLog> {
    let feed_log: FeedLog | null = feed.feed_log
    if (!feed_log) {
      feed_log = new FeedLog();
    }
    return await this.feedLogRepository.save(feed_log);
  }
}
