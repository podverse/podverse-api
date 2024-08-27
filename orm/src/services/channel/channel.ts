import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { Feed } from '@orm/entities/feed/feed';
import { MediumValue, MediumValueValueEnum } from '@orm/entities/mediumValue';
import { applyProperties } from '@orm/lib/applyProperties';

const shortid = require('shortid');

type ChannelInitializeDto = {
  feed: Feed,
  podcast_index_id: number
}

type ChannelUpdateDto = {
  slug?: string | null
  podcast_guid?: string | null
  title: string
  sortable_title: string
  medium_value?: MediumValueValueEnum | null
  has_podcast_index_value_tags?: boolean
  hidden?: boolean
  marked_for_deletion?: boolean
}

export class ChannelService {
  private channelRepository = AppDataSource.getRepository(Channel);

  async getById(id: number): Promise<Channel | null> {
    return this.channelRepository.findOne({ where: { id } });
  }

  async getByIdText(id_text: string): Promise<Channel | null> {
    return this.channelRepository.findOne({ where: { id_text } });
  }

  async getByPodcastIndexId(podcast_index_id: number): Promise<Channel | null> {
    return this.channelRepository.findOne({ where: { podcast_index_id } });
  }

  async getOrCreateByPodcastIndexId(dto: ChannelInitializeDto): Promise<Channel> {
    let channel = await this.getByPodcastIndexId(dto.podcast_index_id);
    if (!channel) {
      channel = new Channel();
      channel.id_text = shortid.generate();
      channel.feed_id = dto.feed.id;
      channel.podcast_index_id = dto.podcast_index_id;
    }
    return await this.channelRepository.save(channel);
  }

  async update(id: number, dto: ChannelUpdateDto): Promise<Channel | null> {
    let channel = await this.getById(id);

    if (!channel) {
      throw new Error(`Channel with id ${id} not found`);
    }

    channel = applyProperties(channel, dto);

    await this.channelRepository.save(channel);

    return await this.getById(id);
  }
}
