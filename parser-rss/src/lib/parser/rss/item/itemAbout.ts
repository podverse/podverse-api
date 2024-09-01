import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemAboutService } from "@orm/services/item/itemAbout";
import { compatItemAboutDto } from "@parser-rss/lib/compat/item";

export const handleParsedItemAbout = async (parsedItem: Episode, item: Item) => {
  const itemAboutService = new ItemAboutService();
  const itemAboutDto = compatItemAboutDto(parsedItem);
  await itemAboutService.update(item, itemAboutDto);
}
