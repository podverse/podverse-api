import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemChatService } from "@orm/services/item/itemChat";
import { compatItemChatDto } from "@parser-rss/lib/compat/partytime/item";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedItemChat = async (parsedItem: Episode, item: Item) => {
  const itemChatService = new ItemChatService();
  const itemChatDto = compatItemChatDto(parsedItem);
  await handleParsedOneData(item, itemChatService, itemChatDto);
}
