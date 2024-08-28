import { AppDataSource } from '@orm/db';
import { Channel } from '@orm/entities/channel/channel';
import { ChannelRemoteItem } from '@orm/entities/channel/channelRemoteItem';
import { MediumValueValueEnum } from '@orm/entities/mediumValue';
import { applyProperties } from '@orm/lib/applyProperties';

type ChannelRemoteItemDto = {
  feed_guid: string
  feed_url: string | null
  item_guid: string | null
  // title: string | null
  medium: MediumValueValueEnum | null
}

export class ChannelRemoteItemService {
  private repository = AppDataSource.getRepository(ChannelRemoteItem);

  async getAll(channel: Channel): Promise<ChannelRemoteItem[]> {
    return this.repository.find({ where: { channel } });
  }

  async getByItemGuid(channel: Channel, item_guid: string): Promise<ChannelRemoteItem | null> {
    return this.repository.findOne({ where: { channel, item_guid } });
  }

  async getByFeedGuid(channel: Channel, feed_guid: string): Promise<ChannelRemoteItem | null> {
    return this.repository.findOne({ where: { channel, feed_guid } });
  }

  async getByFeedUrl(channel: Channel, feed_url: string): Promise<ChannelRemoteItem | null> {
    return this.repository.findOne({ where: { channel, feed_url } });
  }

  async get(channel: Channel, dto: ChannelRemoteItemDto): Promise<ChannelRemoteItem | null> {
    if (dto.item_guid) {
      return this.getByItemGuid(channel, dto.item_guid);
    } else if (dto.feed_guid) {
      return this.getByFeedGuid(channel, dto.feed_guid);
    } else if (dto.feed_url) {
      return this.getByFeedUrl(channel, dto.feed_url);
    }

    return null;
  }

  async update(channel: Channel, dto: ChannelRemoteItemDto): Promise<ChannelRemoteItem> {
    let channel_remote_item = await this.get(channel, dto);

    if (!channel_remote_item) {
      channel_remote_item = new ChannelRemoteItem();
      channel_remote_item.channel = channel;
    }

    channel_remote_item = applyProperties(channel_remote_item, dto);

    return this.repository.save(channel_remote_item);
  }

  async updateMany(channel: Channel,
    dtos: ChannelRemoteItemDto[]): Promise<ChannelRemoteItem[]> {
    const existingChannelRemoteItems = await this.getAll(channel);
    const updatedChannelRemoteItems: ChannelRemoteItem[] = [];
    const dtoUniqueKeys = dtos.map(dto => ({
      feed_guid: dto.feed_guid,
      feed_url: dto.feed_url,
      item_guid: dto.item_guid
    }));
  
    for (const dto of dtos) {
      const channel_remote_item = await this.update(channel, dto);
      updatedChannelRemoteItems.push(channel_remote_item);
    }
    
    await this.repository.save(updatedChannelRemoteItems);

    const channelPodrollRemoteItemsToDelete = existingChannelRemoteItems?.filter(channel_remote_item => 
      dtoUniqueKeys.every(key => 
        key.feed_guid !== channel_remote_item.feed_guid ||
        key.feed_url !== channel_remote_item.feed_url ||
        key.item_guid !== channel_remote_item.item_guid
      )
    );

    if (channelPodrollRemoteItemsToDelete && channelPodrollRemoteItemsToDelete.length > 0) {
      await this.repository.remove(channelPodrollRemoteItemsToDelete);
    }
    
    return updatedChannelRemoteItems;
  }

  async deleteAll(channel: Channel): Promise<void> {
    const channel_remote_items = await this.getAll(channel);
    if (channel_remote_items) {
      await this.repository.remove(channel_remote_items);
    }
  }
}
