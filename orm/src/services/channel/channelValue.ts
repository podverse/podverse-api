import { Channel } from '@orm/entities/channel/channel';
import { ChannelValue } from '@orm/entities/channel/channelValue';
import { BaseManyService } from '@orm/lib/baseManyService';

type ChannelValueDto = {
  type: string
  method: string
  suggested: number | null
}

export class ChannelValueService extends BaseManyService<ChannelValue, 'channel'> {
  constructor() {
    super(ChannelValue, 'channel');
  }

  async update(channel: Channel, dto: ChannelValueDto): Promise<ChannelValue> {
    const whereKeys = ['type', 'method'] as (keyof ChannelValue)[];
    return super._update(channel, whereKeys, dto);
  }

  async updateMany(channel: Channel, dtos: ChannelValueDto[]): Promise<ChannelValue[]> {
    const whereKeys = ['type', 'method'] as (keyof ChannelValue)[];
    return super._updateMany(channel, whereKeys, dtos);
  }
}
