import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelDescription } from '@orm/entities/channel/channelDescription';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelDescriptionDto = {
  value: string
}

export class ChannelDescriptionService {
  private channelDescriptionRepository = AppDataSource.getRepository(ChannelDescription);

  async getByChannel(channel: Channel): Promise<ChannelDescription | null> {
    return this.channelDescriptionRepository.findOne({ where: { channel } });
  }

  async createOrUpdate(channel: Channel, dto: ChannelDescriptionDto): Promise<ChannelDescription | null> {
    let channel_description = await this.getByChannel(channel);

    if (!channel_description) {
      channel_description = new ChannelDescription();
      channel_description.channel = channel;
    }

    channel_description = applyProperties(channel_description, dto);

    return this.channelDescriptionRepository.save(channel_description);
  }
}
