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
  private repository = AppDataSource.getRepository(ChannelLocation);

  async get(channel: Channel): Promise<ChannelLocation | null> {
    return this.repository.findOne({ where: { channel } });
  }

  async update(channel: Channel, dto: ChannelLocationDto): Promise<ChannelLocation | null> {
    let channel_location = await this.get(channel);

    if (!channel_location) {
      channel_location = new ChannelLocation();
      channel_location.channel = channel;
    }

    channel_location = applyProperties(channel_location, dto);

    return this.repository.save(channel_location);
  }

  async delete(channel: Channel): Promise<void> {
    const channelLocation = await this.get(channel);
    if (channelLocation) {
      await this.repository.remove(channelLocation);
    }
  }
}
