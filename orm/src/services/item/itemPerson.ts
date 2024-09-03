import { EntityManager } from 'typeorm';
import { Item } from '@orm/entities/item/item';
import { ItemPerson } from '@orm/entities/item/itemPerson';
import { BaseManyService } from '@orm/services/base/baseManyService';

type ItemPersonDto = {
  name: string
  role: string | null
  person_group: string | 'cast'
  img: string | null
  href: string | null
}

export class ItemPersonService extends BaseManyService<ItemPerson, 'item'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ItemPerson, 'item', transactionalEntityManager);
  }

  async update(item: Item, dto: ItemPersonDto): Promise<ItemPerson> {
    const whereKeys = ['name'] as (keyof ItemPerson)[];
    return super._update(item, whereKeys, dto);
  }

  async updateMany(item: Item, dtos: ItemPersonDto[]): Promise<ItemPerson[]> {
    const whereKeys = ['name'] as (keyof ItemPerson)[];
    return super._updateMany(item, whereKeys, dtos);
  }
}
