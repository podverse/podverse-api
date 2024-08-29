import { Channel } from '@orm/entities/channel/channel';
import { ChannelTrailer } from '@orm/entities/channel/channelTrailer';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ChannelTrailerDto = {
  url: string
  pubdate: Date
  title: string | null
  length: number | null
  type: string | null
  season: number | null
}

export class ChannelTrailerService extends BaseManyService<ChannelTrailer, 'channel'> {
  constructor() {
    super(ChannelTrailer, 'channel');
  }

  async update(channel: Channel, dto: ChannelTrailerDto): Promise<ChannelTrailer> {
    const whereKeys = ['url'] as (keyof ChannelTrailer)[];
    return super._update(channel, whereKeys, dto);
  }

  async updateMany(channel: Channel, dtos: ChannelTrailerDto[]): Promise<ChannelTrailer[]> {
    const whereKeys = ['url'] as (keyof ChannelTrailer)[];
    return super._updateMany(channel, whereKeys, dtos);
  }
}
