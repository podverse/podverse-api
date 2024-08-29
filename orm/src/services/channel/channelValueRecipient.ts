import { ChannelValue } from '@orm/entities/channel/channelValue';
import { ChannelValueReceipient } from '@orm/entities/channel/channelValueRecipient';
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

export class ChannelValueRecipientService extends BaseManyService<ChannelValueReceipient, 'channel_value'> {
  constructor() {
    super(ChannelValueReceipient, 'channel_value');
  }

  async update(channel_value: ChannelValue, dto: ChannelValueRecipientDto): Promise<ChannelValueReceipient> {
    const whereKeys = ['type', 'address', 'custom_key', 'custom_value'] as (keyof ChannelValueReceipient)[];
    return super._update(channel_value, whereKeys, dto);
  }

  async updateMany(channel_value: ChannelValue, dtos: ChannelValueRecipientDto[]): Promise<ChannelValueReceipient[]> {
    const whereKeys = ['type', 'address', 'custom_key', 'custom_value'] as (keyof ChannelValueReceipient)[];
    return super._updateMany(channel_value, whereKeys, dtos);
  }
}
