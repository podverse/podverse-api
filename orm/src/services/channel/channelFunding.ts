import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelFunding } from '@orm/entities/channel/channelFunding';
import { applyProperties } from '@orm/lib/applyProperties';
import { entityUpdateMany } from '@orm/lib/entityUpdateMany';

type ChannelFundingDto = {
  url: string
  title?: string | null
}

export class ChannelFundingService {
  private channelFundingRepository = AppDataSource.getRepository(ChannelFunding);

  async getAllByChannel(channel: Channel): Promise<ChannelFunding[]> {
    return this.channelFundingRepository.find({ where: { channel } });
  }

  async getByChannelAndUrl(channel: Channel, url: string): Promise<ChannelFunding | null> {
    return this.channelFundingRepository.findOne({ where: { channel, url } });
  }

  async update(channel: Channel, dto: ChannelFundingDto): Promise<ChannelFunding> {
    let channel_funding = await this.getByChannelAndUrl(channel, dto.url);

    if (!channel_funding) {
      channel_funding = new ChannelFunding();
      channel_funding.channel = channel;
    }

    channel_funding = applyProperties(channel_funding, dto);

    return this.channelFundingRepository.save(channel_funding);
  }

  async updateMany(channel: Channel, dtos: ChannelFundingDto[]): Promise<ChannelFunding[]> {
    return entityUpdateMany<Channel, ChannelFundingDto, ChannelFunding>(
      channel,
      dtos,
      this.getAllByChannel.bind(this),
      this.update.bind(this),
      this.channelFundingRepository,
      'url'
    );
  }

  async deleteAllByChannel(channel: Channel): Promise<void> {
    const channelFundings = await this.getAllByChannel(channel);
    if (channelFundings) {
      await this.channelFundingRepository.remove(channelFundings);
    }
  }
}
