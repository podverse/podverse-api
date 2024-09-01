import { Episode } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ItemService } from "@orm/services/item/item";
import { ChannelSeasonIndex } from "@orm/services/channel/channelSeason";
import { handleParsedItemAbout } from "@parser-rss/lib/parser/rss/item/itemAbout";
import { handleParsedItemChaptersFeed } from "@parser-rss/lib/parser/rss/item/itemChaptersFeed";
import { handleParsedItemDescription } from "@parser-rss/lib/parser/rss/item/itemDescription";
import { handleParsedItemEnclosure } from "@parser-rss/lib/parser/rss/item/itemEnclosure";
import { handleParsedItemImage } from "@parser-rss/lib/parser/rss/item/itemImage";
import { handleParsedItemLicense } from "@parser-rss/lib/parser/rss/item/itemLicenseService";
import { handleParsedItemLocation } from "@parser-rss/lib/parser/rss/item/itemLocation";
import { handleParsedItemPerson } from "@parser-rss/lib/parser/rss/item/itemPerson";
import { handleParsedItemSeason } from "@parser-rss/lib/parser/rss/item/itemSeason";
import { handleParsedItemSeasonEpisode } from "@parser-rss/lib/parser/rss/item/itemSeasonEpisode";
import { handleParsedItemSocialInteract } from "@parser-rss/lib/parser/rss/item/itemSocialInteract";
import { handleParsedItemSoundbite } from "@parser-rss/lib/parser/rss/item/itemSoundbite";
import { handleParsedItemTranscript } from "@parser-rss/lib/parser/rss/item/itemTranscript";
import { handleParsedItemTxt } from "@parser-rss/lib/parser/rss/item/itemTxt";
import { handleParsedItemValue } from "@parser-rss/lib/parser/rss/item/itemValue";
import { compatItemDto } from "@parser-rss/lib/compat/partytime/item";
import { handleParsedItemChat } from "@parser-rss/lib/parser/rss/item/itemChat";

export const handleParsedItems = async (parsedItems: Episode[], channel: Channel, channelSeasonIndex: ChannelSeasonIndex) => {
  const itemService = new ItemService();
  const existingItems = await itemService.getAllItemsByChannel(channel, { select: ['id'] });
  const existingItemIds = existingItems.map(item => item.id);
  const updatedItemIds: number[] = [];

  for (const parsedItem of parsedItems) {
    const item = await handleParsedItem(parsedItem, channel, channelSeasonIndex);
    updatedItemIds.push(item.id);
  }

  const itemIdsToDelete = existingItemIds.filter(id => !updatedItemIds.includes(id));
  await itemService.deleteMany(itemIdsToDelete);
}

export const handleParsedItem = async (parsedItem: Episode, channel: Channel, channelSeasonIndex: ChannelSeasonIndex) => {
  const itemService = new ItemService();
  const itemDto = compatItemDto(parsedItem);
  const item = await itemService.update(channel, itemDto);

  await handleParsedItemAbout(parsedItem, item);
  await handleParsedItemChaptersFeed(parsedItem, item);
  await handleParsedItemChat(parsedItem, item);

  // // TODO: add itemContentLinkService support after partytime adds chat support
  // const itemContentLinkService = new ItemContentLinkService();
  // const itemContentLinkDtos = compatItemContentLinkDtos(parsedItem);
  // if (itemContentLinkDtos.length) {
  //   await itemContentLinkService.updateMany(item, itemContentLinkDtos);
  // } else {
  //   await itemContentLinkService._deleteAll(item);
  // }

  await handleParsedItemDescription(parsedItem, item);  
  await handleParsedItemEnclosure(parsedItem, item);
  await handleParsedItemImage(parsedItem, item);
  await handleParsedItemLicense(parsedItem, item);
  await handleParsedItemLocation(parsedItem, item);
  await handleParsedItemPerson(parsedItem, item);
  await handleParsedItemSeason(parsedItem, item, channelSeasonIndex);
  await handleParsedItemSeasonEpisode(parsedItem, item);
  await handleParsedItemSocialInteract(parsedItem, item);
  await handleParsedItemSoundbite(parsedItem, item);
  await handleParsedItemTranscript(parsedItem, item);
  await handleParsedItemTxt(parsedItem, item);
  await handleParsedItemValue(parsedItem, item);

  return item;
}
