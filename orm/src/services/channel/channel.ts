import { Channel } from '@orm/entities/channel/channel';
import { Feed } from '@orm/entities/feed/feed';
import { MediumValueEnum } from '@orm/entities/medium';
import { applyProperties } from '@orm/lib/applyProperties';
import { Repository } from 'typeorm';
import { AppDataSource } from '@orm/db';

type ChannelInitializeDto = {
  feed: Feed,
  podcast_index_id: number
}

type ChannelDto = {
  slug?: string | null
  podcast_guid?: string | null
  title: string | null
  sortable_title: string | null
  medium?: MediumValueEnum | null
  has_podcast_index_value?: boolean
  hidden?: boolean
  marked_for_deletion?: boolean
}

export class ChannelService {
  protected repository: Repository<Channel>;

  constructor() {
    this.repository = AppDataSource.getRepository(Channel);
  }

  async get(id: number): Promise<Channel | null> {
    return this.repository.findOne({ where: { id } });
  }

  async _getByIdText(id_text: string): Promise<Channel | null> {
    return this.repository.findOne({ where: { id_text } });
  }

  async getByPodcastIndexId(podcast_index_id: number): Promise<Channel | null> {
    return this.repository.findOne({ where: { podcast_index_id } });
  }

  async getOrCreateByPodcastIndexId(dto: ChannelInitializeDto): Promise<Channel> {
    let channel = await this.getByPodcastIndexId(dto.podcast_index_id);

    if (!channel) {
      channel = new Channel();
      channel.feed_id = dto.feed.id;
      channel.podcast_index_id = dto.podcast_index_id;
      channel = await this.repository.save(channel);
    }

    return channel;
  }

  async update(id: number, dto: ChannelDto): Promise<Channel> {
    let channel = await this.get(id);

    if (!channel) {
      channel = new Channel();
    }

    channel = applyProperties(channel, dto);

    return this.repository.save(channel);
  }
}
