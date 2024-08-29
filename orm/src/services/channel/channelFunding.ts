import { Channel } from '@orm/entities/channel/channel';
import { ChannelFunding } from '@orm/entities/channel/channelFunding';
import { applyProperties } from '@orm/lib/applyProperties';
import { BaseManyService } from '@orm/lib/baseManyService';
import { entityUpdateMany } from '@orm/lib/entityUpdateMany';

type ChannelFundingDto = {
  url: string
  title?: string | null
}

export class ChannelFundingService extends BaseManyService<ChannelFunding, 'channel'> {
  constructor() {
    super(ChannelFunding, 'channel');
  }

  async get(channel: Channel, url: string): Promise<ChannelFunding | null> {
    return this.repository.findOne({ where: { channel, url } });
  }

  async update(channel: Channel, dto: ChannelFundingDto): Promise<ChannelFunding> {
    let channel_funding = await this.get(channel, dto.url);

    if (!channel_funding) {
      channel_funding = new ChannelFunding();
      channel_funding.channel = channel;
    }

    channel_funding = applyProperties(channel_funding, dto);

    return this.repository.save(channel_funding);
  }

  async updateMany(channel: Channel, dtos: ChannelFundingDto[]): Promise<ChannelFunding[]> {
    return entityUpdateMany<Channel, ChannelFundingDto, ChannelFunding>(
      channel,
      dtos,
      this.getAll.bind(this),
      this.update.bind(this),
      this.repository,
      'url'
    );
  }
}
