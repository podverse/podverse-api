import { Episode } from "podcast-partytime";
import { Item } from "@orm/entities/item/item";
import { ItemValueService } from "@orm/services/item/itemValue";
import { compatItemValueDtos } from "@parser/lib/compat/partytime/item";
import { ItemValueRecipientService } from "@orm/services/item/itemValueRecipient";
import { ItemValueTimeSplitService } from "@orm/services/item/itemValueTimeSplit";
import { ItemValueTimeSplitRecipientService } from "@orm/services/item/itemValueTimeSplitRecipient";
import { ItemValueTimeSplitRemoteItemService } from "@orm/services/item/itemValueTimeSplitRemoteItem";

export const handleParsedItemValue = async (parsedItem: Episode, item: Item) => {
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
