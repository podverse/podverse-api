import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemSoundbiteService } from "@orm/services/item/itemSoundbite";
import { compatItemSoundbiteDtos } from "@parser/lib/compat/partytime/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemSoundbite = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemSoundbiteService = new ItemSoundbiteService(transactionalEntityManager);
  const itemSoundbiteDtos = compatItemSoundbiteDtos(parsedItem);
  await handleParsedManyData(item, itemSoundbiteService, itemSoundbiteDtos);
};
