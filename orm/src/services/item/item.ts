import { Channel } from '@orm/entities/channel/channel';
import { Item } from '@orm/entities/item/item';
import { applyProperties } from '@orm/lib/applyProperties';
import { FindManyOptions, IsNull, Not, Repository } from 'typeorm';
import { AppDataSource } from '@orm/db';

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

export class ItemService {
  protected repository: Repository<Item>;

  constructor() {
    this.repository = AppDataSource.getRepository(Item);
  }

  async get(id: number): Promise<Item | null> {
    return this.repository.findOne({ where: { id }, relations: ['item_chapters_feed'] });
  }

  async _getByIdText(id_text: string): Promise<Item | null> {
    return this.repository.findOne({ where: { id_text } });
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

  async getAllItemsByChannel(channel: Channel, options?: FindManyOptions<Item>): Promise<Item[]> {
    return this.repository.find({
      where: {
        channel,
        live_item: {
          id: IsNull()
        }
      },
      ...options
    });
  }

  async getAllItemsWithLiveItemByChannel(channel: Channel, options?: FindManyOptions<Item>): Promise<Item[]> {
    return this.repository.find({
      where: {
        channel,
        live_item: {
          id: Not(IsNull())
        }
      },
      ...options
    });
  }

  async update(channel: Channel, dto: ItemDto): Promise<Item> {
    let item = await this.getBy(channel, {
      guid_enclosure_url: dto.guid_enclosure_url,
      guid: dto.guid
    });

    if (!item) {
      item = new Item();
      item.guid = dto.guid;
      item.guid_enclosure_url = dto.guid_enclosure_url;
      item.channel = channel;
      item = await this.repository.save(item);
    }

    item = applyProperties(item, dto);

    return this.repository.save(item);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteMany(ids: number[]): Promise<void> {
    if (ids.length) {
      await this.repository.delete(ids);
    }
  }
}
