import { Request, Response } from "express";
import { ChannelService, Item, itemGetManyRelations, ItemService, LiveItemStatusEnum } from "podverse-orm";

export class LiveItemController {
  private static itemService = new ItemService();
  private static channelService = new ChannelService();

  static async getManyByChannel(req: Request, res: Response): Promise<void> {
    const { channelIdOrIdText } = req.params;

    const channel = await LiveItemController.channelService.getByIdOrIdText(channelIdOrIdText);
    if (!channel) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }

    const items = await LiveItemController.itemService.getManyByChannelWithLiveItem(channel, {
      relations: itemGetManyRelations
    });

    const live: typeof items = [];
    const pending: typeof items = [];
    const ended: typeof items = [];

    for (const item of items) {
      const status = item.live_item?.live_item_status;
      if (status.id === LiveItemStatusEnum.Live) {
        live.push(item);
      } else if (status.id === LiveItemStatusEnum.Pending) {
        pending.push(item);
      } else if (status.id === LiveItemStatusEnum.Ended) {
        ended.push(item);
      }
    }

    live.sort((a: Item, b: Item) =>
      new Date(b.live_item!.start_time).getTime() - new Date(a.live_item!.start_time).getTime()
    );
    pending.sort((a: Item, b: Item) =>
      new Date(b.live_item!.start_time).getTime() - new Date(a.live_item!.start_time).getTime()
    );
    ended.sort((a: Item, b: Item) =>
      new Date(b.live_item!.end_time ?? 0).getTime() - new Date(a.live_item!.end_time ?? 0).getTime()
    );

    const combined = [...live, ...pending, ...ended];

    res.json(combined);
  }
}
