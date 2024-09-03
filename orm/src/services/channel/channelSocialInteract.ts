import { EntityManager } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelSocialInteract } from '@orm/entities/channel/channelSocialInteract';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ChannelSocialInteractDto = {
  protocol: string
  uri: string
  account_id: string | null
  account_url: string | null
  priority: number | null
}

export class ChannelSocialInteractService extends BaseManyService<ChannelSocialInteract, 'channel'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ChannelSocialInteract, 'channel', transactionalEntityManager);
  }

  async update(channel: Channel, dto: ChannelSocialInteractDto): Promise<ChannelSocialInteract> {
    const whereKeys = ['uri'] as (keyof ChannelSocialInteract)[];
    return super._update(channel, whereKeys, dto);
  }

  async updateMany(channel: Channel, dtos: ChannelSocialInteractDto[]): Promise<ChannelSocialInteract[]> {
    const whereKeys = ['uri'] as (keyof ChannelSocialInteract)[];
    return super._updateMany(channel, whereKeys, dtos);
  }
}
