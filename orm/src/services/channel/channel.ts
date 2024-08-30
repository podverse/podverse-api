import { Channel } from '@orm/entities/channel/channel';
import { Feed } from '@orm/entities/feed/feed';
import { MediumValueEnum } from '@orm/entities/medium';
import { BaseOneTextIdService } from '../base/baseTextIdService';

const shortid = require('shortid');

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

export class ChannelService extends BaseOneTextIdService<Channel> {
  constructor() {
    super(Channel);
  }

  async getByPodcastIndexId(podcast_index_id: number): Promise<Channel | null> {
    return this.repository.findOne({ where: { podcast_index_id } });
  }

  async getOrCreateByPodcastIndexId(dto: ChannelInitializeDto): Promise<Channel> {
    let channel = await this.getByPodcastIndexId(dto.podcast_index_id);

    if (!channel) {
      channel = new Channel();
      channel.id_text = shortid.generate();
      channel.feed_id = dto.feed.id;
      channel.podcast_index_id = dto.podcast_index_id;
      channel = await this.repository.save(channel);
    }

    return channel;
  }

  async update(id: number, dto: ChannelDto): Promise<Channel> {
    return super._update(id, dto);
  }
}
