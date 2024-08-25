import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelAbout } from '@orm/entities/channel/channelAbout';
import { Feed } from '@orm/entities/feed/feed';
import { MediumValue, MediumValueValueEnum } from '@orm/entities/mediumValue';
import { applyProperties } from '@orm/lib/applyProperties';

const shortid = require('shortid');

type ChannelInitializeDto = {
  feed: Feed,
  podcast_index_id: number
}

type ChannelAboutUpdateDto = {
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

  async createOrUpdate(channel: Channel, dto: ChannelAboutUpdateDto): Promise<ChannelAbout | null> {
    let channelAbout = await this.getByChannel(channel);
    console.log('channelAbout1', channelAbout);

    if (!channelAbout) {
      channelAbout = new ChannelAbout();
      channelAbout.channel = channel;
    }

    channelAbout = applyProperties(channelAbout, dto);

    console.log('channelAbout2', channelAbout);

    return this.channelAboutRepository.save(channelAbout);
  }
}
