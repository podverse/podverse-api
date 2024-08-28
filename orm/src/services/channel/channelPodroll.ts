import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelPodroll } from '@orm/entities/channel/channelPodroll';

export class ChannelPodrollService {
  private channelPodrollRepository = AppDataSource.getRepository(ChannelPodroll);

  async getByChannel(channel: Channel): Promise<ChannelPodroll | null> {
    return this.channelPodrollRepository.findOne({ where: { channel } });
  }

  async createOrUpdate(channel: Channel): Promise<ChannelPodroll> {
    let channel_podroll = await this.getByChannel(channel);

    if (!channel_podroll) {
      channel_podroll = new ChannelPodroll();
      channel_podroll.channel = channel;
    }

    return this.channelPodrollRepository.save(channel_podroll);
  }

  async deleteByChannel(channel: Channel): Promise<void> {
    const channel_podroll = await this.getByChannel(channel);
    if (channel_podroll) {
      await this.channelPodrollRepository.remove(channel_podroll);
    }
  }
}
