import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelLocation } from '@orm/entities/channel/channelLocation';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelLocationDto = {
  geo: string | null
  osm: string | null
  name: string | null
}

export class ChannelLocationService {
  private channelLocationRepository = AppDataSource.getRepository(ChannelLocation);

  async getByChannel(channel: Channel): Promise<ChannelLocation | null> {
    return this.channelLocationRepository.findOne({ where: { channel } });
  }

  async createOrUpdate(channel: Channel, dto: ChannelLocationDto): Promise<ChannelLocation | null> {
    let channel_location = await this.getByChannel(channel);

    if (!channel_location) {
      channel_location = new ChannelLocation();
      channel_location.channel = channel;
    }

    channel_location = applyProperties(channel_location, dto);

    return this.channelLocationRepository.save(channel_location);
  }

  async deleteByChannel(channel: Channel): Promise<void> {
    const channelLocation = await this.getByChannel(channel);
    if (channelLocation) {
      await this.channelLocationRepository.remove(channelLocation);
    }
  }
}
