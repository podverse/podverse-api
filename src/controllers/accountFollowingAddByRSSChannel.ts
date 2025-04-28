import { Request, Response } from "express";
import Joi from "joi";
import { AccountFollowingAddByRSSChannelService, AccountService } from "podverse-orm";
import { ensureAuthenticated } from "@api/lib/auth";
import { handleGenericErrorResponse } from "./helpers/error";
import { validateBodyObject, validateParamsObject } from "@api/lib/validation";

const addRSSChannelSchema = Joi.object({
  feed_url: Joi.string().uri().required(),
  title: Joi.string().allow(null, ''),
  image_url: Joi.string().uri().allow(null, '')
});

const removeRSSChannelSchema = Joi.object({
  feed_url: Joi.string().uri().required()
});

const getFollowedAddByRSSChannelsSchema = Joi.object({
  account_id_text: Joi.string().required()
});

class AccountFollowingAddByRSSChannelController {
  private static accountService = new AccountService();
  private static accountFollowingAddByRSSChannelService = new AccountFollowingAddByRSSChannelService();

  static async getFollowedAddByRSSChannels(req: Request, res: Response): Promise<void> {
    validateParamsObject(getFollowedAddByRSSChannelsSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        const { account_id_text } = req.params;

        try {
          const account = await AccountFollowingAddByRSSChannelController.accountService.getByIdText(account_id_text);
          if (!account) {
            res.status(404).json({ message: "Account not found." });
            return;
          }

          if (account.id !== req.user?.id) {
            res.status(403).json({ message: "Account not found." });
            return;
          }

          const channels = await AccountFollowingAddByRSSChannelController.accountFollowingAddByRSSChannelService.getFollowedAddByRSSChannels(account.id);
          res.json(channels);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async addOrUpdateRSSChannel(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(addRSSChannelSchema, req, res, async () => {
        const account = req.user!;
        const dto = req.body;

        try {
          await AccountFollowingAddByRSSChannelController.accountFollowingAddByRSSChannelService.addOrUpdateRSSChannel(account.id, dto);
          res.status(204).end();
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async removeRSSChannel(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(removeRSSChannelSchema, req, res, async () => {
        const account = req.user!;
        const { feed_url } = req.body;

        try {
          await AccountFollowingAddByRSSChannelController.accountFollowingAddByRSSChannelService.removeRSSChannel(account.id, feed_url);
          res.status(204).end();
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }
}

export { AccountFollowingAddByRSSChannelController };
