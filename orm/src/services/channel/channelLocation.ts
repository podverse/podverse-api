import { EntityManager } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelLocation } from '@orm/entities/channel/channelLocation';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ChannelLocationDto = {
  geo: string | null
  osm: string | null
  name: string | null
}

export class ChannelLocationService extends BaseOneService<ChannelLocation, 'channel'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ChannelLocation, 'channel', transactionalEntityManager);
  }

  async update(channel: Channel, dto: ChannelLocationDto): Promise<ChannelLocation> {
    return super._update(channel, dto);
  }
}
