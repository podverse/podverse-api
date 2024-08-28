import { AppDataSource } from '@orm/db';
import { ChannelPodroll } from '@orm/entities/channel/channelPodroll';
import { ChannelPodrollRemoteItem } from '@orm/entities/channel/channelPodrollRemoteItem';
import { MediumValueValueEnum } from '@orm/entities/mediumValue';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelPodrollRemoteItemDto = {
  feed_guid: string
  feed_url: string | null
  item_guid: string | null
  // title: string | null
  medium: MediumValueValueEnum | null
}

export class ChannelPodrollRemoteItemService {
  private channelPodrollRemoteItemRepository = AppDataSource.getRepository(ChannelPodrollRemoteItem);

  async getAllByChannelPodroll(channel_podroll: ChannelPodroll): Promise<ChannelPodrollRemoteItem[] | null> {
    return this.channelPodrollRemoteItemRepository.find({ where: { channel_podroll } });
  }

  async getByChannelAndFeedGuid(channel_podroll: ChannelPodroll, feed_guid: string): Promise<ChannelPodrollRemoteItem | null> {
    return this.channelPodrollRemoteItemRepository.findOne({ where: { channel_podroll, feed_guid } });
  }

  async getByChannelAndFeedUrl(channel_podroll: ChannelPodroll, feed_url: string): Promise<ChannelPodrollRemoteItem | null> {
    return this.channelPodrollRemoteItemRepository.findOne({ where: { channel_podroll, feed_url } });
  }

  async getByChannelAndItemGuid(channel_podroll: ChannelPodroll, item_guid: string): Promise<ChannelPodrollRemoteItem | null> {
    return this.channelPodrollRemoteItemRepository.findOne({ where: { channel_podroll, item_guid } });
  }

  async getByChannelPodrollAndData(channel_podroll: ChannelPodroll, dto: ChannelPodrollRemoteItemDto): Promise<ChannelPodrollRemoteItem | null> {
    if (dto.item_guid) {
      return this.getByChannelAndItemGuid(channel_podroll, dto.item_guid);
    } else if (dto.feed_guid) {
      return this.getByChannelAndFeedGuid(channel_podroll, dto.feed_guid);
    } else if (dto.feed_url) {
      return this.getByChannelAndFeedUrl(channel_podroll, dto.feed_url);
    }

    return null;
  }

  async createOrUpdate(channel_podroll: ChannelPodroll, dto: ChannelPodrollRemoteItemDto): Promise<ChannelPodrollRemoteItem> {
    let channel_podroll_remote_item = await this.getByChannelPodrollAndData(channel_podroll, dto);

    if (!channel_podroll_remote_item) {
      channel_podroll_remote_item = new ChannelPodrollRemoteItem();
      channel_podroll_remote_item.channel_podroll = channel_podroll;
    }

    channel_podroll_remote_item = applyProperties(channel_podroll_remote_item, dto);

    return this.channelPodrollRemoteItemRepository.save(channel_podroll_remote_item);
  }

  async createOrUpdateMany(channel_podroll: ChannelPodroll,
    dtos: ChannelPodrollRemoteItemDto[]): Promise<ChannelPodrollRemoteItem[]> {
    const existingChannelPodrollRemoteItems = await this.getAllByChannelPodroll(channel_podroll);
    const updatedChannelPodrollRemoteItems: ChannelPodrollRemoteItem[] = [];
    const dtoUniqueKeys = dtos.map(dto => ({
      feed_guid: dto.feed_guid,
      feed_url: dto.feed_url,
      item_guid: dto.item_guid
    }));
  
    for (const dto of dtos) {
      const channel_podroll_remote_item = await this.createOrUpdate(channel_podroll, dto);
      updatedChannelPodrollRemoteItems.push(channel_podroll_remote_item);
    }
    
    await this.channelPodrollRemoteItemRepository.save(updatedChannelPodrollRemoteItems);

    const channelPodrollRemoteItemsToDelete = existingChannelPodrollRemoteItems?.filter(channel_podroll_remote_item => 
      dtoUniqueKeys.every(key => 
        key.feed_guid !== channel_podroll_remote_item.feed_guid ||
        key.feed_url !== channel_podroll_remote_item.feed_url ||
        key.item_guid !== channel_podroll_remote_item.item_guid
      )
    );

    if (channelPodrollRemoteItemsToDelete && channelPodrollRemoteItemsToDelete.length > 0) {
      await this.channelPodrollRemoteItemRepository.remove(channelPodrollRemoteItemsToDelete);
    }
    
    return updatedChannelPodrollRemoteItems;
  }

  async deleteAllByChannel(channel_podroll: ChannelPodroll): Promise<void> {
    const channel_podroll_remote_items = await this.getAllByChannelPodroll(channel_podroll);
    if (channel_podroll_remote_items) {
      await this.channelPodrollRemoteItemRepository.remove(channel_podroll_remote_items);
    }
  }
}
