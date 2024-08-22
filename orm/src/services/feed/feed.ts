import { AppDataSource } from '@orm/db';
import { Feed } from '@orm/entities/feed/feed';
import { FeedFlagStatusStatusEnum } from '@orm/entities/feed/feedFlagStatus';
import { FeedLog } from '@orm/entities/feed/feedLog';
import { ChannelService } from '@orm/services/channel/channel';
import { FeedLogService } from '@orm/services/feed/feedLog';

const channelService = new ChannelService();
const feedLogService = new FeedLogService();

type FeedCreateDto = {
  url: string,
  podcast_index_id: number
}

export class FeedService {
  private feedRepository = AppDataSource.getRepository(Feed);
  private feedLogRepository = AppDataSource.getRepository(FeedLog);

  async getAll(): Promise<Feed[]> {
    return await this.feedRepository.createQueryBuilder('feed')
      .leftJoinAndSelect('feed.channel', 'channel')
      .getMany();
  }

  async getOrCreateFeed({ url, podcast_index_id }: FeedCreateDto): Promise<Feed> {
    const feed = await this.feedRepository.findOne({
      where: { url },
      relations: ['feed_flag_status', 'feed_log'],
    });

    if (feed) {
      return feed;
    }

    return this.create({ url, podcast_index_id });
  }

  async create({ url, podcast_index_id }: FeedCreateDto): Promise<Feed> {
    const feed = new Feed();
    feed.url = url;
    feed.feed_flag_status = FeedFlagStatusStatusEnum.None;
    feed.is_parsing = new Date();
    feed.parsing_priority = 1;
    feed.container_id = '';
    
    const newFeed = await this.feedRepository.save(feed);

    await feedLogService.create({ feed: newFeed });

    const channel = await channelService.getOrCreateByPodcastIndexId({
      feed: newFeed,
      podcast_index_id
    });
    
    newFeed.channel = channel;
    return this.feedRepository.save(newFeed);
  }
}
