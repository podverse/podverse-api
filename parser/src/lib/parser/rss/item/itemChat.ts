import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemChatService } from "@orm/services/item/itemChat";
import { compatItemChatDto } from "@parser/lib/compat/partytime/item";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedItemChat = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemChatService = new ItemChatService(transactionalEntityManager);
  const itemChatDto = compatItemChatDto(parsedItem);
  await handleParsedOneData(item, itemChatService, itemChatDto);
}
