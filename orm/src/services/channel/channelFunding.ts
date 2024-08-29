import { Channel } from '@orm/entities/channel/channel';
import { ChannelFunding } from '@orm/entities/channel/channelFunding';
import { BaseManyService } from '@orm/lib/baseManyService';

type ChannelFundingDto = {
  url: string
  title?: string | null
}

export class ChannelFundingService extends BaseManyService<ChannelFunding, 'channel'> {
  constructor() {
    super(ChannelFunding, 'channel');
  }

  async update(channel: Channel, dto: ChannelFundingDto): Promise<ChannelFunding> {
    const whereKeys = ['url'] as (keyof ChannelFunding)[];
    return super._update(channel, whereKeys, dto);
  }

  async updateMany(channel: Channel, dtos: ChannelFundingDto[]): Promise<ChannelFunding[]> {
    const whereKeys = ['url'] as (keyof ChannelFunding)[];
    return super._updateMany(channel, whereKeys, dtos);
  }
}
