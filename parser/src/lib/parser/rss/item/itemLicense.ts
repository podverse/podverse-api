import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { EntityManager } from "@orm/lib/typeORMTypes";
import { ItemLicenseService } from "@orm/services/item/itemLicense";
import { compatItemLicenseDto } from "@parser/lib/compat/partytime/item";
import { handleParsedOneData } from "../base/handleParsedOneData";

export const handleParsedItemLicense = async (
  parsedItem: Episode,
  item: Item,
  transactionalEntityManager: EntityManager
) => {
  const itemLicenseService = new ItemLicenseService(transactionalEntityManager);
  const itemLicenseDto = compatItemLicenseDto(parsedItem);
  await handleParsedOneData(item, itemLicenseService, itemLicenseDto);
}
