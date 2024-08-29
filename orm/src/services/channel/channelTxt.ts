import { Channel } from '@orm/entities/channel/channel';
import { ChannelTxt } from '@orm/entities/channel/channelTxt';
import { BaseManyService } from '@orm/lib/baseManyService';

type ChannelTxtDto = {
  purpose: string | null
  value: string
}

export class ChannelTxtService extends BaseManyService<ChannelTxt, 'channel'> {
  constructor() {
    super(ChannelTxt, 'channel');
  }

  async update(channel: Channel, dto: ChannelTxtDto): Promise<ChannelTxt> {
    const whereKeys = ['value'] as (keyof ChannelTxt)[];
    return super._update(channel, whereKeys, dto);
  }

  async updateMany(channel: Channel, dtos: ChannelTxtDto[]): Promise<ChannelTxt[]> {
    const whereKeys = ['value'] as (keyof ChannelTxt)[];
    return super._updateMany(channel, whereKeys, dtos);
  }
}
