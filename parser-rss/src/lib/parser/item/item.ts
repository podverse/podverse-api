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

export const handleParsedItems = async (parsedItems: Episode[], channel: Channel, channelSeasonIndex: ChannelSeasonIndex) => {
  for (const parsedItem of parsedItems) {
    await handleParsedItem(parsedItem, channel, channelSeasonIndex);
  }
}

export const handleParsedItem = async (parsedItem: Episode, channel: Channel, channelSeasonIndex: ChannelSeasonIndex) => {
  const itemService = new ItemService();
  const itemDto = compatItemDto(parsedItem);
  const item = await itemService.update(channel, itemDto);

  const itemAboutService = new ItemAboutService();
  const itemAboutDto = compatItemAboutDto(parsedItem);
  await itemAboutService.update(item, itemAboutDto);

  const itemChaptersFeedService = new ItemChaptersFeedService();
  const itemChaptersFeedDto = compatItemChaptersFeedDto(parsedItem);
  await handleParsedOneData(item, itemChaptersFeedService, itemChaptersFeedDto);

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

  const itemDescriptionService = new ItemDescriptionService();
  const itemDescriptionDto = compatItemDescriptionDto(parsedItem);
  await handleParsedOneData(item, itemDescriptionService, itemDescriptionDto);

  const itemEnclosureService = new ItemEnclosureService();
  const itemEnclosureDtos = compatItemEnclosureDtos(parsedItem);
  
  if (itemEnclosureDtos.length > 0) {
    for (const itemEnclosureDto of itemEnclosureDtos) {
      const item_enclosure = await itemEnclosureService.update(item, itemEnclosureDto.item_enclosure);
      
      const itemEnclosureSourceDtos = itemEnclosureDto.item_enclosure_sources;
      if (itemEnclosureSourceDtos.length > 0) {
        const itemEnclosureSourceService = new ItemEnclosureSourceService();
        await itemEnclosureSourceService.updateMany(item_enclosure, itemEnclosureSourceDtos);
      } else {
        await itemEnclosureService._deleteAll(item);
      }

      const itemEnclosureIntegrityDto = itemEnclosureDto.item_enclosure_integrity;
      if (itemEnclosureIntegrityDto) {
        const itemEnclosureIntegrityService = new ItemEnclosureIntegrityService();
        await itemEnclosureIntegrityService.update(item_enclosure, itemEnclosureIntegrityDto);
      }
    }
  } else {
    await itemEnclosureService._deleteAll(item);
  }

  // // TODO: add item funding support after partytime adds funding support
  // const itemFundingService = new ItemFundingService();
  // const itemFundingDto = compatItemFundingDto(parsedItem);
  // await handleParsedManyData(item, itemFundingService, itemFundingDto);

  const itemImageService = new ItemImageService();
  const itemImageDto = compatItemImageDtos(parsedItem);
  await handleParsedManyData(item, itemImageService, itemImageDto);

  const itemLicenseService = new ItemLicenseService();
  const itemLicenseDto = compatItemLicenseDto(parsedItem);
  await handleParsedOneData(item, itemLicenseService, itemLicenseDto);

  const itemLocationService = new ItemLocationService();
  const itemLocationDto = compatItemLocationDto(parsedItem);
  await handleParsedOneData(item, itemLocationService, itemLocationDto);

  const itemPersonService = new ItemPersonService();
  const itemPersonDtos = compatItemPersonDtos(parsedItem);
  await handleParsedManyData(item, itemPersonService, itemPersonDtos);

  const itemSeasonService = new ItemSeasonService();
  const itemSeasonDto = compatItemSeasonDto(parsedItem);

  if (itemSeasonDto) {
    const channel_season = itemSeasonDto.number ? channelSeasonIndex[itemSeasonDto.number] : null;
    if (channel_season) {
      const enrichedItemSeasonDto: ItemSeasonDto = {
        title: itemSeasonDto.title,
        channel_season
      }
      await handleParsedOneData(item, itemSeasonService, enrichedItemSeasonDto);
    }
  }

  const itemSeasonEpisodeService = new ItemSeasonEpisodeService();
  const itemSeasonEpisodeDto = compatItemSeasonEpisodeDto(parsedItem);
  await handleParsedOneData(item, itemSeasonEpisodeService, itemSeasonEpisodeDto);

  const itemSocialInteractService = new ItemSocialInteractService();
  const itemSocialInteractDtos = compatItemSocialInteractDtos(parsedItem);
  await handleParsedManyData(item, itemSocialInteractService, itemSocialInteractDtos);

  const itemSoundbiteService = new ItemSoundbiteService();
  const itemSoundbiteDtos = compatItemSoundbiteDtos(parsedItem);
  await handleParsedManyData(item, itemSoundbiteService, itemSoundbiteDtos);

  const itemTranscriptService = new ItemTranscriptService();
  const itemTranscriptDtos = compatItemTranscriptDtos(parsedItem);
  await handleParsedManyData(item, itemTranscriptService, itemTranscriptDtos);

  const itemTxtService = new ItemTxtService();
  const itemTxtDtos = compatItemTxtDtos(parsedItem);
  await handleParsedManyData(item, itemTxtService, itemTxtDtos);

  const itemValueService = new ItemValueService();
  const itemValueDtos = compatItemValueDtos(parsedItem);
  const itemValueRecipientService = new ItemValueRecipientService();
  const itemValueTimeSplitService = new ItemValueTimeSplitService();
  const itemValueTimeSplitRecipientService = new ItemValueTimeSplitRecipientService();
  const itemValueTimeSplitRemoteItemService = new ItemValueTimeSplitRemoteItemService();

  if (itemValueDtos.length > 0) {
    for (const itemValueDto of itemValueDtos) {
      const item_value = await itemValueService.update(item, itemValueDto.item_value);

      const itemValueRecipientDtos = itemValueDto.item_value_recipients;
      if (itemValueRecipientDtos.length > 0) {
        for (const itemValueRecipientDto of itemValueRecipientDtos) {
          await itemValueRecipientService.update(item_value, itemValueRecipientDto);
        }
      } else {
        await itemValueRecipientService._deleteAll(item_value);
      }

      const itemValueTimeSplitDtos = itemValueDto.item_value_time_splits;
      if (itemValueTimeSplitDtos.length > 0) {
        for (const itemValueTimeSplitDto of itemValueTimeSplitDtos) {
          const item_value_time_split = await itemValueTimeSplitService.update(item_value, itemValueTimeSplitDto.meta);

          const itemValueTimeSplitRecipientDtos = itemValueTimeSplitDto.item_value_time_splits_recipients;
          if (itemValueTimeSplitRecipientDtos.length > 0) {
            for (const itemValueTimeSplitRecipientDto of itemValueTimeSplitRecipientDtos) {
              await itemValueTimeSplitRecipientService.update(item_value_time_split, itemValueTimeSplitRecipientDto);
            }
          } else {
            await itemValueTimeSplitRecipientService._deleteAll(item_value_time_split);
          }

          const itemValueTimeSplitRemoteItemDto = itemValueTimeSplitDto.item_value_time_splits_remote_item;
          if (itemValueTimeSplitRemoteItemDto) {
            await itemValueTimeSplitRemoteItemService.update(item_value_time_split, itemValueTimeSplitRemoteItemDto);
          } else {
            await itemValueTimeSplitRemoteItemService._deleteAll(item_value_time_split);
          }
        }
      } else {
        await itemValueTimeSplitService._deleteAll(item_value);
      }
    }
  } else {
    await itemValueService._deleteAll(item);
  }
}
