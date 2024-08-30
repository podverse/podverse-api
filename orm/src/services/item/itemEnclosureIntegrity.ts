import { ItemEnclosure } from '@orm/entities/item/itemEnclosure';
import { ItemEnclosureIntegrity } from '@orm/entities/item/itemEnclosureIntegrity';
import { BaseOneService } from '@orm/services/base/baseOneService';

type ItemEnclosureIntegrityDto = {
  type: "sri" | "pgp-signature"
  value: string
}

export class ItemEnclosureIntegrityService extends BaseOneService<ItemEnclosureIntegrity, 'item_enclosure'> {
  constructor() {
    super(ItemEnclosureIntegrity, 'item_enclosure');
  }

  async update(item_enclosure: ItemEnclosure, dto: ItemEnclosureIntegrityDto): Promise<ItemEnclosureIntegrity> {
    return super._update(item_enclosure, dto);
  }
}
