import { Channel } from '@orm/entities/channel/channel';
import { ChannelSeason } from '@orm/entities/channel/channelSeason';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ChannelSeasonDto = {
  number: number
  name: string
}

export class ChannelSeasonService extends BaseManyService<ChannelSeason, 'channel'> {
  constructor() {
    super(ChannelSeason, 'channel');
  }

  async update(channel: Channel, dto: ChannelSeasonDto): Promise<ChannelSeason> {
    const whereKeys = ['number'] as (keyof ChannelSeason)[];
    return super._update(channel, whereKeys, dto);
  }

  async updateMany(channel: Channel, dtos: ChannelSeasonDto[]): Promise<ChannelSeason[]> {
    const whereKeys = ['number'] as (keyof ChannelSeason)[];
    return super._updateMany(channel, whereKeys, dtos);
  }
}
