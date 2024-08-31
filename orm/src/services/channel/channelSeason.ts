import { Channel } from '@orm/entities/channel/channel';
import { ChannelSeason } from '@orm/entities/channel/channelSeason';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ChannelSeasonDto = {
  number: number
  name: string | null
}

export type ChannelSeasonIndex = Record<number, ChannelSeason>

export class ChannelSeasonService extends BaseManyService<ChannelSeason, 'channel'> {
  constructor() {
    super(ChannelSeason, 'channel');
  }

  async getChannelSeasonIndex(channel: Channel): Promise<ChannelSeasonIndex> {
    const channelSeasonIndex: ChannelSeasonIndex = {};
    
    const channel_seasons = await this.repository.find({ where: { channel } });
  
    for (const channel_season of channel_seasons) {
      channelSeasonIndex[channel_season.number] = channel_season;
    }
  
    return channelSeasonIndex;
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
