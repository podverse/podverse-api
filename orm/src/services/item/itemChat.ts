import { EntityManager } from 'typeorm';
import { Item } from '@orm/entities/item/item';
import { ItemChat } from '@orm/entities/item/itemChat';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ItemChatDto = {
  server: string
  protocol: string | null
  account_id: string | null
  space: string | null
}

export class ItemChatService extends BaseOneService<ItemChat, 'item'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ItemChat, 'item', transactionalEntityManager);
  }

  async update(item: Item, dto: ItemChatDto): Promise<ItemChat> {
    return super._update(item, dto);
  }
}
