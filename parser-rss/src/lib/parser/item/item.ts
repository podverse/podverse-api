import { Episode } from "podcast-partytime";
import { Channel } from "@orm/entities/channel/channel";
import { ItemService } from "@orm/services/item/item";
import { compatItemAboutDto, compatItemChaptersFeedDto, compatItemDescriptionDto, compatItemDto, compatItemEnclosureDtos, compatItemImageDtos, compatItemLicenseDto, compatItemLocationDto, compatItemPersonDtos, compatItemSeasonDto, compatItemSeasonEpisodeDto, compatItemSocialInteractDtos, compatItemSoundbiteDtos } from "@parser-rss/lib/compat/item";
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
import { ItemSeasonService } from "@orm/services/item/itemSeason";
import { ItemSeasonEpisodeService } from "@orm/services/item/itemSeasonEpisode";
import { ItemSocialInteractService } from "@orm/services/item/itemSocialInteract";
import { ItemSoundbiteService } from "@orm/services/item/itemSoundbite";

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

  // // TODO: add itemSeasonService support after partytime adds channel season support
  // const itemSeasonService = new ItemSeasonService();
  // const itemSeasonDto = compatItemSeasonDto(parsedItem);
  // await handleParsedOneData(item, itemSeasonService, itemSeasonDto);

  // // TODO: add itemSeasonEpisodeService support after partytime adds channel season episode support
  // const itemSeasonEpisodeService = new ItemSeasonEpisodeService();
  // const itemSeasonEpisodeDto = compatItemSeasonEpisodeDto(parsedItem);
  // await handleParsedOneData(item, itemSeasonEpisodeService, itemSeasonEpisodeDto);

  const itemSocialInteractService = new ItemSocialInteractService();
  const itemSocialInteractDtos = compatItemSocialInteractDtos(parsedItem);
  await handleParsedManyData(item, itemSocialInteractService, itemSocialInteractDtos);

  const itemSoundbiteService = new ItemSoundbiteService();
  const itemSoundbiteDtos = compatItemSoundbiteDtos(parsedItem);
  await handleParsedManyData(item, itemSoundbiteService, itemSoundbiteDtos);
}
