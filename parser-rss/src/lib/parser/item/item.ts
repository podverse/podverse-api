import { Episode } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ItemService } from "@orm/services/item/item";
import { compatItemAboutDto, compatItemChaptersFeedDto, compatItemDescriptionDto, compatItemDto, compatItemEnclosureDtos, compatItemImageDtos, compatItemLicenseDto, compatItemLocationDto, compatItemPersonDtos, compatItemSeasonDto, compatItemSeasonEpisodeDto, compatItemSocialInteractDtos, compatItemSoundbiteDtos, compatItemTranscriptDtos, compatItemTxtDtos, compatItemValueDtos } from "@parser-rss/lib/compat/item";
import { ItemAboutService } from "@orm/services/item/itemAbout";
import { ItemChaptersFeedService } from "@orm/services/item/itemChaptersFeed";
import { ItemDescriptionService } from "@orm/services/item/itemDescription";
import { ItemEnclosureService } from "@orm/services/item/itemEnclosure";
import { ItemEnclosureSourceService } from "@orm/services/item/itemEnclosureSource";
import { ItemEnclosureIntegrityService } from "@orm/services/item/itemEnclosureIntegrity";
import { handleParsedOneData } from "../base/handleParsedOneData";
import { handleParsedManyData } from "../base/handleParsedManyData";
import { ItemImageService } from "@orm/services/item/itemImage";
import { ItemLicenseService } from "@orm/services/item/itemLicense";
import { ItemLocationService } from "@orm/services/item/itemLocation";
import { ItemPersonService } from "@orm/services/item/itemPerson";
import { ItemSocialInteractService } from "@orm/services/item/itemSocialInteract";
import { ItemSoundbiteService } from "@orm/services/item/itemSoundbite";
import { ItemTranscriptService } from "@orm/services/item/itemTranscript";
import { ItemTxtService } from "@orm/services/item/itemTxt";
import { ItemValueService } from "@orm/services/item/itemValue";
import { ItemValueRecipientService } from "@orm/services/item/itemValueRecipient";
import { ItemValueTimeSplitService } from "@orm/services/item/itemValueTimeSplit";
import { ItemValueTimeSplitRecipientService } from "@orm/services/item/itemValueTimeSplitRecipient";
import { ItemValueTimeSplitRemoteItemService } from "@orm/services/item/itemValueTimeSplitRemoteItem";
import { ItemSeasonDto, ItemSeasonService } from "@orm/services/item/itemSeason";
import { ChannelSeasonIndex, ChannelSeasonService } from "@orm/services/channel/channelSeason";
import { ItemSeasonEpisodeService } from "@orm/services/item/itemSeasonEpisode";
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
}
