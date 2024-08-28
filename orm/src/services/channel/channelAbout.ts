import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelAbout } from '@orm/entities/channel/channelAbout';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelAboutDto = {
  author: string | null
  explicit: boolean | null
  language: string | null
  website_link_url: string | null
}

export class ChannelAboutService {
  private repository = AppDataSource.getRepository(ChannelAbout);

  async get(channel: Channel): Promise<ChannelAbout | null> {
    return this.repository.findOne({ where: { channel } });
  }

  async update(channel: Channel, dto: ChannelAboutDto): Promise<ChannelAbout | null> {
    let channel_about = await this.get(channel);

    if (!channel_about) {
      channel_about = new ChannelAbout();
      channel_about.channel = channel;
    }

    channel_about = applyProperties(channel_about, dto);

    return this.repository.save(channel_about);
  }
}
