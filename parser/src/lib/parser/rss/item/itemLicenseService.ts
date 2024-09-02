import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemLicenseService } from "@orm/services/item/itemLicense";
import { compatItemLicenseDto } from "@parser-rss/lib/compat/partytime/item";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedItemLicense = async (parsedItem: Episode, item: Item) => {
  const itemLicenseService = new ItemLicenseService();
  const itemLicenseDto = compatItemLicenseDto(parsedItem);
  await handleParsedOneData(item, itemLicenseService, itemLicenseDto);
}
