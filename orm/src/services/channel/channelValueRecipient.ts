import { ChannelValue } from '@orm/entities/channel/channelValue';
import { ChannelValueRecipient } from '@orm/entities/channel/channelValueRecipient';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ChannelValueRecipientDto = {
  type: string
  address: string
  split: number
  name: string | null
  custom_key: string | null
  custom_value: string | null
  fee: boolean
}

export class ChannelValueRecipientService extends BaseManyService<ChannelValueRecipient, 'channel_value'> {
  constructor() {
    super(ChannelValueRecipient, 'channel_value');
  }

  async update(channel_value: ChannelValue, dto: ChannelValueRecipientDto): Promise<ChannelValueRecipient> {
    const whereKeys = ['type', 'address', 'custom_key', 'custom_value'] as (keyof ChannelValueRecipient)[];
    return super._update(channel_value, whereKeys, dto);
  }

  async updateMany(channel_value: ChannelValue, dtos: ChannelValueRecipientDto[]): Promise<ChannelValueRecipient[]> {
    const whereKeys = ['type', 'address', 'custom_key', 'custom_value'] as (keyof ChannelValueRecipient)[];
    return super._updateMany(channel_value, whereKeys, dtos);
  }
}
