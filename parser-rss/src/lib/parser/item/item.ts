import { Episode } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ItemService } from "@orm/services/item/item";
import { ChannelSeasonIndex } from "@orm/services/channel/channelSeason";
import { handleParsedItemAbout } from "./itemAbout";
import { handleParsedItemChaptersFeed } from "./itemChapters";
import { handleParsedItemDescription } from "./itemDescription";
import { handleParsedItemEnclosure } from "./itemEnclosure";
import { handleParsedItemImage } from "./itemImage";
import { handleParsedItemLicense } from "./itemLicenseService";
import { handleParsedItemLocation } from "./itemLocation";
import { handleParsedItemPerson } from "./itemPerson";
import { handleParsedItemSeason } from "./itemSeason";
import { handleParsedItemSeasonEpisode } from "./itemSeasonEpisode";
import { handleParsedItemSocialInteract } from "./itemSocialInteract";
import { handleParsedItemSoundbite } from "./itemSoundbite";
import { handleParsedItemTranscript } from "./itemTranscript";
import { handleParsedItemTxt } from "./itemTxt";
import { handleParsedItemValue } from "./itemValue";
import { compatItemDto } from "@parser-rss/lib/compat/item";

export const handleParsedItems = async (parsedItems: Episode[], channel: Channel, channelSeasonIndex: ChannelSeasonIndex) => {
  for (const parsedItem of parsedItems) {
    await handleParsedItem(parsedItem, channel, channelSeasonIndex);
  }
}

export const handleParsedItem = async (parsedItem: Episode, channel: Channel, channelSeasonIndex: ChannelSeasonIndex) => {
  const itemService = new ItemService();
  const itemDto = compatItemDto(parsedItem);
  const item = await itemService.update(channel, itemDto);

  await handleParsedItemAbout(parsedItem, item);

  await handleParsedItemChaptersFeed(parsedItem, item);

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

  await handleParsedItemDescription(parsedItem, item);  
  await handleParsedItemEnclosure(parsedItem, item);

  // // TODO: add item funding support after partytime adds funding support
  // const itemFundingService = new ItemFundingService();
  // const itemFundingDto = compatItemFundingDto(parsedItem);
  // await handleParsedManyData(item, itemFundingService, itemFundingDto);

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
