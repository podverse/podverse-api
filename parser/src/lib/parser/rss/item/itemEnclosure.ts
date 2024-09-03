import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemEnclosureService } from "@orm/services/item/itemEnclosure";
import { compatItemEnclosureDtos } from "@parser/lib/compat/partytime/item";
import { ItemEnclosureSourceService } from "@orm/services/item/itemEnclosureSource";
import { ItemEnclosureIntegrityService } from "@orm/services/item/itemEnclosureIntegrity";

export const handleParsedItemEnclosure = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemEnclosureService = new ItemEnclosureService(transactionalEntityManager);
  const itemEnclosureDtos = compatItemEnclosureDtos(parsedItem);
  
  if (itemEnclosureDtos.length > 0) {
    for (const itemEnclosureDto of itemEnclosureDtos) {
      const item_enclosure = await itemEnclosureService.update(item, itemEnclosureDto.item_enclosure);
      
      const itemEnclosureSourceDtos = itemEnclosureDto.item_enclosure_sources;
      if (itemEnclosureSourceDtos.length > 0) {
        const itemEnclosureSourceService = new ItemEnclosureSourceService(transactionalEntityManager);
        await itemEnclosureSourceService.updateMany(item_enclosure, itemEnclosureSourceDtos);
      } else {
        await itemEnclosureService._deleteAll(item);
      }

      const itemEnclosureIntegrityDto = itemEnclosureDto.item_enclosure_integrity;
      if (itemEnclosureIntegrityDto) {
        const itemEnclosureIntegrityService = new ItemEnclosureIntegrityService(transactionalEntityManager);
        await itemEnclosureIntegrityService.update(item_enclosure, itemEnclosureIntegrityDto);
      }
    }
  } else {
    await itemEnclosureService._deleteAll(item);
  }
}
