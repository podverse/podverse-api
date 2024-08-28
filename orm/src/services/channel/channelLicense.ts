import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelLicense } from '@orm/entities/channel/channelLicense';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelLicenseDto = {
  identifier: string
  url: string | null
}

export class ChannelLicenseService {
  private repository = AppDataSource.getRepository(ChannelLicense);

  async get(channel: Channel): Promise<ChannelLicense | null> {
    return this.repository.findOne({ where: { channel } });
  }

  async update(channel: Channel, dto: ChannelLicenseDto): Promise<ChannelLicense | null> {
    let channel_license = await this.get(channel);

    if (!channel_license) {
      channel_license = new ChannelLicense();
      channel_license.channel = channel;
    }

    channel_license = applyProperties(channel_license, dto);

    return this.repository.save(channel_license);
  }

  async delete(channel: Channel): Promise<void> {
    const channelLicense = await this.get(channel);
    if (channelLicense) {
      await this.repository.remove(channelLicense);
    }
  }
}
