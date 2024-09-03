import { EntityManager } from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelSeason } from '@orm/entities/channel/channelSeason';
import { ChannelTrailer } from '@orm/entities/channel/channelTrailer';
import { BaseManyService } from '@orm/services/base/baseManyService';

export type ChannelTrailerDto = {
  url: string
  pubdate: Date
  title: string | null
  length: number | null
  type: string | null
  channel_season: ChannelSeason | null
}

export class ChannelTrailerService extends BaseManyService<ChannelTrailer, 'channel'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ChannelTrailer, 'channel', transactionalEntityManager);
  }

  async update(channel: Channel, dto: ChannelTrailerDto): Promise<ChannelTrailer> {
    const whereKeys = ['url'] as (keyof ChannelTrailer)[];
    return super._update(channel, whereKeys, dto);
  }

  async updateMany(channel: Channel, dtos: ChannelTrailerDto[]): Promise<ChannelTrailer[]> {
    const whereKeys = ['url'] as (keyof ChannelTrailer)[];
    return super._updateMany(channel, whereKeys, dtos, { relations: ['channel_season'] });
  }
}
