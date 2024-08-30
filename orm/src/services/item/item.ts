import { Channel } from '@orm/entities/channel/channel';
import { BaseOneTextIdService } from '../base/baseTextIdService';
import { Item } from '@orm/entities/item/item';
import { applyProperties } from '@orm/lib/applyProperties';

const shortid = require('shortid');

type ItemDto = {
  title: string | null
  pubdate: Date | null
  guid: string | null
  guid_enclosure_url: string
}

type ItemGetByDto = {
  guid: string | null
  guid_enclosure_url: string
}

export class ItemService extends BaseOneTextIdService<Item> {
  constructor() {
    super(Item);
  }

  async getBy(channel: Channel, dto: ItemGetByDto): Promise<Item | null> {
    let item = null;

    if (dto.guid) {
      item = await this.getByGuid(channel, dto.guid);
    }
    
    if (!item && dto.guid_enclosure_url) {
      item = await this.getByEnclosureUrl(channel, dto.guid_enclosure_url);
    }

    return item;
  }

  async getByGuid(channel: Channel, guid: string): Promise<Item | null> {
    return this.repository.findOne({
      where: {
        channel,
        guid
      }
    });
  }

  async getByEnclosureUrl(channel: Channel, guid_enclosure_url: string): Promise<Item | null> {
    return this.repository.findOne({
      where: {
        channel,
        guid_enclosure_url
      }
    });
  }

  async update(channel: Channel, dto: ItemDto): Promise<Item> {
    let item = await this.getBy(channel, {
      guid_enclosure_url: dto.guid_enclosure_url,
      guid: dto.guid
    });

    if (!item) {
      item = new Item();
      item.id_text = shortid.generate();
      item.guid = dto.guid;
      item.guid_enclosure_url = dto.guid_enclosure_url;
      item.channel = channel;
      item = await this.repository.save(item);
    }

    item = applyProperties(item, dto);

    return super._update(item.id, dto);
  }
}
