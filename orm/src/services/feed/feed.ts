import { AppDataSource } from '@orm/db';
import { Feed } from '@orm/entities/feed/feed';
import { FeedFlagStatusStatusEnum } from '@orm/entities/feed/feedFlagStatus';
import { ChannelService } from '@orm/services/channel/channel';
import { FeedLogService } from '@orm/services/feed/feedLog';
import { FeedFlagStatusService } from './feedFlagStatus';

const channelService = new ChannelService();
const feedLogService = new FeedLogService();

type FeedCreateDto = {
  url: string,
  podcast_index_id: number
}

export class FeedService {
  private repository = AppDataSource.getRepository(Feed);

  async getAll(): Promise<Feed[]> {
    return await this.repository.find({
      relations: ['channel']
    });
  }

  async getOrCreate({ url, podcast_index_id }: FeedCreateDto): Promise<Feed> {
    const feed = await this.repository.findOne({
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

    const feedFlagStatusService = new FeedFlagStatusService();
    const feed_flag_status = await feedFlagStatusService.get(FeedFlagStatusStatusEnum.None);
    if (feed_flag_status) {
      feed.feed_flag_status = feed_flag_status;
    }

    feed.is_parsing = new Date();
    feed.parsing_priority = 1;
    feed.container_id = '';

    const newFeed = await this.repository.save(feed);
    await feedLogService.update({ feed: newFeed });

    const channel = await channelService.getOrCreateByPodcastIndexId({
      feed: newFeed,
      podcast_index_id
    });
    
    newFeed.channel = channel;
    return this.repository.save(newFeed);
  }
}
