import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemSocialInteractService } from "@orm/services/item/itemSocialInteract";
import { compatItemSocialInteractDtos } from "@parser-rss/lib/compat/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemSocialInteract = async (parsedItem: Episode, item: Item) => {
  const itemSocialInteractService = new ItemSocialInteractService();
  const itemSocialInteractDtos = compatItemSocialInteractDtos(parsedItem);
  await handleParsedManyData(item, itemSocialInteractService, itemSocialInteractDtos);
}
