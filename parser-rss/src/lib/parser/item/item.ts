import { Episode } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ItemService } from "@orm/services/item/item";
import { compatItemAboutDto, compatItemDto } from "@parser-rss/lib/compat/item";
import { ItemAboutService } from "@orm/services/item/itemAbout";

export const handleParsedItems = async (parsedItems: Episode[], channel: Channel) => {
  for (const parsedItem of parsedItems) {
    await handleParsedItem(parsedItem, channel);
  }
}

export const handleParsedItem = async (parsedItem: Episode, channel: Channel) => {
  const itemService = new ItemService();
  const itemDto = compatItemDto(parsedItem);
  const item = await itemService.update(channel, itemDto);

  const itemAboutService = new ItemAboutService();
  const itemAboutDto = compatItemAboutDto(parsedItem);
  await itemAboutService.update(item, itemAboutDto);
}
