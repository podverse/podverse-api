import { Episode } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ItemService } from "@orm/services/item/item";
import { compatItemAboutDto, compatItemChaptersFeedDto, compatItemDto } from "@parser-rss/lib/compat/item";
import { ItemAboutService } from "@orm/services/item/itemAbout";
import { ItemChaptersFeedService } from "@orm/services/item/itemChaptersFeed";
import { ItemContentLinkService } from "@orm/services/item/itemContentLink";

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

  const itemChaptersFeedService = new ItemChaptersFeedService();
  const itemChaptersFeedDto = compatItemChaptersFeedDto(parsedItem);
  if (itemChaptersFeedDto) {
    await itemChaptersFeedService.update(item, itemChaptersFeedDto);
  } else {
    await itemChaptersFeedService._delete(item);
  }

  // // TODO: add itemChatService support after partytime adds chat support
  // const itemChatService = new ItemChatService();
  // const itemChatDto = compatItemChatDto(parsedItem);
  // if (itemChatDto) {
  //   await itemChatService.update(item, itemChatDto);
  // }

  // // TODO: add itemContentLinkService support after partytime adds chat support
  // const itemContentLinkService = new ItemContentLinkService();
  // const itemContentLinkDtos = compatItemContentLinkDtos(parsedItem);
  // if (itemContentLinkDtos.length) {
  //   await itemContentLinkService.updateMany(item, itemContentLinkDtos);
  // } else {
  //   await itemContentLinkService._deleteAll(item);
  // }

}
