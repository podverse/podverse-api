import { EntityManager } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelDescription } from '@orm/entities/channel/channelDescription';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ChannelDescriptionDto = {
  value: string
}

export class ChannelDescriptionService extends BaseOneService<ChannelDescription, 'channel'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ChannelDescription, 'channel', transactionalEntityManager);
  }

  async update(channel: Channel, dto: ChannelDescriptionDto): Promise<ChannelDescription> {
    return super._update(channel, dto);
  }
}
