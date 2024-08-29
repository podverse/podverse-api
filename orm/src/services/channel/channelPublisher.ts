import { Channel } from '@orm/entities/channel/channel';
import { ChannelPublisher } from '@orm/entities/channel/channelPublisher';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ChannelPublisherDto = {}

export class ChannelPublisherService extends BaseOneService<ChannelPublisher, 'channel'> {
  constructor() {
    super(ChannelPublisher, 'channel');
  }

  async update(channel: Channel, dto: ChannelPublisherDto): Promise<ChannelPublisher> {
    return super._update(channel, dto);
  }
}
