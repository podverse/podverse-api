import { Request, Response } from "express";
import Joi from "joi";
import { LIVE_ITEM_STATUSES } from "podverse-helpers";
import { ChannelService, Item, itemGetManyRelations, ItemService, LiveItemStatusEnum } from "podverse-orm";
import { validateQueryObject } from "@api/lib/validation";
import { ItemController } from "@api/controllers/item";

export const getManyLiveSchema = Joi.object({
  liveItemType: Joi.string().valid(...LIVE_ITEM_STATUSES).required()
}).unknown(true);

export class LiveItemController {
  private static itemService = new ItemService();
  private static channelService = new ChannelService();

  static async getManyGlobalRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyLiveSchema, req, res, async () => {
      return ItemController.getManyGlobalRecent(req, res);
    });
  }

  static async getManyGlobalTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyLiveSchema, req, res, async () => {
      return ItemController.getManyGlobalTop(req, res);
    });
  }

  static async getManyCategoryRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyLiveSchema, req, res, async () => {
      return ItemController.getManyCategoryRecent(req, res);
    });
  }

  static async getManyCategoryTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyLiveSchema, req, res, async () => {
      return ItemController.getManyCategoryTop(req, res);
    });
  }

  static async getManySubscribedRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyLiveSchema, req, res, async () => {
      return ItemController.getManySubscribedRecent(req, res);
    });
  }

  static async getManySubscribedTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyLiveSchema, req, res, async () => {
      return ItemController.getManySubscribedTop(req, res);
    });
  }

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
