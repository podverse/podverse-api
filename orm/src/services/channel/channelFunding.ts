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

  async getAllByChannel(channel: Channel): Promise<ChannelFunding[] | null> {
    return this.channelFundingRepository.find({ where: { channel } });
  }

  async getByChannelAndUrl(channel: Channel, url: string): Promise<ChannelFunding | null> {
    return this.channelFundingRepository.findOne({ where: { channel, url } });
  }

  async createOrUpdate(channel: Channel, dto: ChannelFundingDto): Promise<ChannelFunding> {
    let channel_funding = await this.getByChannelAndUrl(channel, dto.url);

    if (!channel_funding) {
      channel_funding = new ChannelFunding();
      channel_funding.channel = channel;
    }

    channel_funding = applyProperties(channel_funding, dto);

    return this.channelFundingRepository.save(channel_funding);
  }

  async createOrUpdateMany(channel: Channel, dtos: ChannelFundingDto[]): Promise<ChannelFunding[]> {
    const existingChannelFundings = await this.getAllByChannel(channel);
    const updatedChannelFundings: ChannelFunding[] = [];
    const dtoUrls = dtos.map(dto => dto.url);
  
    for (const dto of dtos) {
      const channel_funding = await this.createOrUpdate(channel, dto);
      updatedChannelFundings.push(channel_funding);
    }
    
    await this.channelFundingRepository.save(updatedChannelFundings);

    const fundingsToDelete = existingChannelFundings?.filter(funding => !dtoUrls.includes(funding.url));
    if (fundingsToDelete && fundingsToDelete.length > 0) {
      await this.channelFundingRepository.remove(fundingsToDelete);
    }
    
    return updatedChannelFundings;
  }
}
