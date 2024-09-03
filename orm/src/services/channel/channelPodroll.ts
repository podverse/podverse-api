import { EntityManager } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelPodroll } from '@orm/entities/channel/channelPodroll';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ChannelPodrollDto = object

export class ChannelPodrollService extends BaseOneService<ChannelPodroll, 'channel'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ChannelPodroll, 'channel', transactionalEntityManager);
  }

  async update(channel: Channel, dto: ChannelPodrollDto): Promise<ChannelPodroll> {
    return super._update(channel, dto);
  }
}
