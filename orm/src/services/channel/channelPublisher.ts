import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelPublisher } from '@orm/entities/channel/channelPublisher';

export class ChannelPublisherService {
  private repository = AppDataSource.getRepository(ChannelPublisher);

  async get(channel: Channel): Promise<ChannelPublisher | null> {
    return this.repository.findOne({ where: { channel } });
  }

  async update(channel: Channel): Promise<ChannelPublisher> {
    let channel_publisher = await this.get(channel);

    if (!channel_publisher) {
      channel_publisher = new ChannelPublisher();
      channel_publisher.channel = channel;
    }

    return this.repository.save(channel_publisher);
  }

  async delete(channel: Channel): Promise<void> {
    const channel_publisher = await this.get(channel);
    if (channel_publisher) {
      await this.repository.remove(channel_publisher);
    }
  }
}
