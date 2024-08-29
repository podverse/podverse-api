import { Channel } from '@orm/entities/channel/channel';
import { ChannelPodroll } from '@orm/entities/channel/channelPodroll';
import { BaseOneService } from '@orm/lib/baseOneService';

type ChannelPodrollDto = {}

export class ChannelPodrollService extends BaseOneService<ChannelPodroll, 'channel'> {
  constructor() {
    super(ChannelPodroll, 'channel');
  }

  async update(channel: Channel, dto: ChannelPodrollDto): Promise<ChannelPodroll> {
    return super._update(channel, dto);
  }
}
