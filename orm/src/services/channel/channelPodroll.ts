import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelPodroll } from '@orm/entities/channel/channelPodroll';

export class ChannelPodrollService {
  private repository = AppDataSource.getRepository(ChannelPodroll);

  async get(channel: Channel): Promise<ChannelPodroll | null> {
    return this.repository.findOne({ where: { channel } });
  }

  async update(channel: Channel): Promise<ChannelPodroll> {
    let channel_podroll = await this.get(channel);

    if (!channel_podroll) {
      channel_podroll = new ChannelPodroll();
      channel_podroll.channel = channel;
    }

    return this.repository.save(channel_podroll);
  }

  async delete(channel: Channel): Promise<void> {
    const channel_podroll = await this.get(channel);
    if (channel_podroll) {
      await this.repository.remove(channel_podroll);
    }
  }
}
