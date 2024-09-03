import { EntityManager } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelPerson } from '@orm/entities/channel/channelPerson';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ChannelPersonDto = {
  name: string
  role: string | null
  person_group: string | 'cast'
  img: string | null
  href: string | null
}

export class ChannelPersonService extends BaseManyService<ChannelPerson, 'channel'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ChannelPerson, 'channel', transactionalEntityManager);
  }

  async update(channel: Channel, dto: ChannelPersonDto): Promise<ChannelPerson> {
    const whereKeys = ['name'] as (keyof ChannelPerson)[];
    return super._update(channel, whereKeys, dto);
  }

  async updateMany(channel: Channel, dtos: ChannelPersonDto[]): Promise<ChannelPerson[]> {
    const whereKeys = ['name'] as (keyof ChannelPerson)[];
    return super._updateMany(channel, whereKeys, dtos);
  }
}
