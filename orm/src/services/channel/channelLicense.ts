import { Channel } from '@orm/entities/channel/channel';
import { ChannelLicense } from '@orm/entities/channel/channelLicense';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ChannelLicenseDto = {
  identifier: string
  url: string | null
}

export class ChannelLicenseService extends BaseOneService<ChannelLicense, 'channel'> {
  constructor() {
    super(ChannelLicense, 'channel');
  }

  async update(channel: Channel, dto: ChannelLicenseDto): Promise<ChannelLicense> {
    return super._update(channel, dto);
  }
}
