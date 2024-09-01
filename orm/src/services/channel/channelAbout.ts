import { Channel } from '@orm/entities/channel/channel';
import { ChannelAbout } from '@orm/entities/channel/channelAbout';
import { ChannelItunesTypeItunesTypeEnum } from '@orm/entities/channel/channelItunesType';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ChannelAboutDto = {
  author: string | null
  explicit: boolean | null
  language: string | null
  last_pub_date: Date | null
  website_link_url: string | null
  itunes_type: ChannelItunesTypeItunesTypeEnum
  episode_count: number
}

export class ChannelAboutService extends BaseOneService<ChannelAbout, 'channel'> {
  constructor() {
    super(ChannelAbout, 'channel');
  }

  async update(channel: Channel, dto: ChannelAboutDto): Promise<ChannelAbout> {
    return super._update(channel, dto, { relations: ['itunes_type'] });
  }
}
