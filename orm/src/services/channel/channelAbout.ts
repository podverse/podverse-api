import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelAbout } from '@orm/entities/channel/channelAbout';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelAboutDto = {
  author?: string | null
  explicit?: boolean | null
  language?: string | null
  website_link_url?: string | null
}

export class ChannelAboutService {
  private channelAboutRepository = AppDataSource.getRepository(ChannelAbout);

  async getByChannel(channel: Channel): Promise<ChannelAbout | null> {
    return this.channelAboutRepository.findOne({ where: { channel } });
  }

  async createOrUpdate(channel: Channel, dto: ChannelAboutDto): Promise<ChannelAbout | null> {
    let channel_about = await this.getByChannel(channel);

    if (!channel_about) {
      channel_about = new ChannelAbout();
      channel_about.channel = channel;
    }

    channel_about = applyProperties(channel_about, dto);

    return this.channelAboutRepository.save(channel_about);
  }
}
