import { AppDataSource } from '@orm/db';
import { Feed } from '@orm/entities/feed/feed';
import { FeedFlagStatusStatusEnum } from '@orm/entities/feed/feedFlagStatus';
import { ChannelService } from '@orm/services/channel/channel';
import { FeedLogService } from '@orm/services/feed/feedLog';
import { FeedFlagStatusService } from './feedFlagStatus';
import { applyProperties } from '@orm/lib/applyProperties';

const channelService = new ChannelService();
const feedLogService = new FeedLogService();

type FeedCreateDto = {
  url: string,
  podcast_index_id: number
}

type FeedUpdateDto = {
  url?: string
  feed_flag_status_id?: number
  is_parsing?: Date | null
  parsing_priority?: number
  last_parsed_file_hash?: string | null
  container_id?: string | null
}

export class FeedService {
  private repository = AppDataSource.getRepository(Feed);

  async get(id: number): Promise<Feed | null> {
    return this.repository.findOne({ where: { id } });
  }

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

    feed.is_parsing = null;
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

  async update(id: number, dto: FeedUpdateDto): Promise<Feed> {
    let feed = await this.get(id);

    if (!feed) {
      throw new Error(`FeedService.update: feed ${id} not found`);
    }

    feed = applyProperties(feed, dto);

    return this.repository.save(feed);
  }
}
