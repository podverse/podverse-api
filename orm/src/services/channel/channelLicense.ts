import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelLicense } from '@orm/entities/channel/channelLicense';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelLicenseDto = {
  identifier: string
  url: string | null
}

export class ChannelLicenseService {
  private channelLicenseRepository = AppDataSource.getRepository(ChannelLicense);

  async getByChannel(channel: Channel): Promise<ChannelLicense | null> {
    return this.channelLicenseRepository.findOne({ where: { channel } });
  }

  async createOrUpdate(channel: Channel, dto: ChannelLicenseDto): Promise<ChannelLicense | null> {
    let channel_license = await this.getByChannel(channel);

    if (!channel_license) {
      channel_license = new ChannelLicense();
      channel_license.channel = channel;
    }

    channel_license = applyProperties(channel_license, dto);

    return this.channelLicenseRepository.save(channel_license);
  }

  async deleteByChannel(channel: Channel): Promise<void> {
    const channelLicense = await this.getByChannel(channel);
    if (channelLicense) {
      await this.channelLicenseRepository.remove(channelLicense);
    }
  }
}
