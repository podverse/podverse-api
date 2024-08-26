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
    let channelDescription = await this.getByChannel(channel);

    if (!channelDescription) {
      channelDescription = new ChannelDescription();
      channelDescription.channel = channel;
    }

    channelDescription = applyProperties(channelDescription, dto);

    return this.channelDescriptionRepository.save(channelDescription);
  }
}
