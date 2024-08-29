import { Channel } from '@orm/entities/channel/channel';
import { ChannelLocation } from '@orm/entities/channel/channelLocation';
import { BaseOneService } from '@orm/lib/baseOneService';

type ChannelLocationDto = {
  geo: string | null
  osm: string | null
  name: string | null
}

export class ChannelLocationService extends BaseOneService<ChannelLocation, 'channel'> {
  constructor() {
    super(ChannelLocation, 'channel');
  }

  async update(channel: Channel, dto: ChannelLocationDto): Promise<ChannelLocation> {
    return super.update(channel, dto);
  }
}