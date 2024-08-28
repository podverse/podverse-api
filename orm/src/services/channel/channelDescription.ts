import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelDescription } from '@orm/entities/channel/channelDescription';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelDescriptionDto = {
  value: string
}

export class ChannelDescriptionService {
  private repository = AppDataSource.getRepository(ChannelDescription);

  async get(channel: Channel): Promise<ChannelDescription | null> {
    return this.repository.findOne({ where: { channel } });
  }

  async update(channel: Channel, dto: ChannelDescriptionDto): Promise<ChannelDescription | null> {
    let channel_description = await this.get(channel);

    if (!channel_description) {
      channel_description = new ChannelDescription();
      channel_description.channel = channel;
    }

    channel_description = applyProperties(channel_description, dto);

    return this.repository.save(channel_description);
  }

  async delete(channel: Channel): Promise<void> {
    const channel_description = await this.get(channel);
    if (channel_description) {
      await this.repository.remove(channel_description);
    }
  }
}
