import { AppDataSource } from '@orm/db';
import { Feed } from '@orm/entities/feed/feed';
import { FeedFlagStatusStatusEnum } from '@orm/entities/feed/feedFlagStatus';

export class FeedService {
  private feedRepository = AppDataSource.getRepository(Feed);

  async getAll(): Promise<Feed[]> {
    return await this.feedRepository.find();
  }

  async create(url: string): Promise<Feed> {
    console.log('hey');
    const feed = new Feed();
    console.log('feed', feed);
    feed.url = url;
    feed.feed_flag_status_id = FeedFlagStatusStatusEnum.None;
    feed.is_parsing = new Date();
    feed.parsing_priority = 1;
    feed.container_id = '1234abcd';
    return await this.feedRepository.save(feed);
  }
}
