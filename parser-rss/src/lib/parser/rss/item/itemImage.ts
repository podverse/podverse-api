import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemImageService } from "@orm/services/item/itemImage";
import { compatItemImageDtos } from "@parser-rss/lib/compat/partytime/item";
import { handleParsedManyData } from "../base/handleParsedManyData";

export const handleParsedItemImage = async (parsedItem: Episode, item: Item) => {
  const itemImageService = new ItemImageService();
  const itemImageDtos = compatItemImageDtos(parsedItem);
  await handleParsedManyData(item, itemImageService, itemImageDtos);
}
