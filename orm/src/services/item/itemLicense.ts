import { EntityManager } from 'typeorm';
import { Item } from '@orm/entities/item/item';
import { ItemLicense } from '@orm/entities/item/itemLicense';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ItemLicenseDto = {
  identifier: string
  url: string | null
}

export class ItemLicenseService extends BaseOneService<ItemLicense, 'item'> {
  constructor(transactionalEntityManager?: EntityManager) {
    super(ItemLicense, 'item', transactionalEntityManager);
  }

  async update(item: Item, dto: ItemLicenseDto): Promise<ItemLicense> {
    return super._update(item, dto);
  }
}
