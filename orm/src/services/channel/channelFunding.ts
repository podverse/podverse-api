import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelFunding } from '@orm/entities/channel/channelFunding';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelFundingDto = {
  url: string
  title?: string | null
}

export class ChannelFundingService {
  private channelFundingRepository = AppDataSource.getRepository(ChannelFunding);

  async getByChannel(channel: Channel): Promise<ChannelFunding | null> {
    return this.channelFundingRepository.findOne({ where: { channel } });
  }

  async createOrUpdate(channel: Channel, dto: ChannelFundingDto): Promise<ChannelFunding | null> {
    let channelFunding = await this.getByChannel(channel);

    if (!channelFunding) {
      channelFunding = new ChannelFunding();
      channelFunding.channel = channel;
    }

    channelFunding = applyProperties(channelFunding, dto);

    return this.channelFundingRepository.save(channelFunding);
  }
}
