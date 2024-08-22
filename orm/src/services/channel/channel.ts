import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { Feed } from '@orm/entities/feed/feed';

const shortid = require('shortid');

type ChannelInitializeDto = {
  feed: Feed,
  podcast_index_id: number
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
}
