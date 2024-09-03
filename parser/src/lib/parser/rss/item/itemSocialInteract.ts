import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemSocialInteractService } from "@orm/services/item/itemSocialInteract";
import { compatItemSocialInteractDtos } from "@parser/lib/compat/partytime/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemSocialInteract = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemSocialInteractService = new ItemSocialInteractService(transactionalEntityManager);
  const itemSocialInteractDtos = compatItemSocialInteractDtos(parsedItem);
  await handleParsedManyData(item, itemSocialInteractService, itemSocialInteractDtos);
};
