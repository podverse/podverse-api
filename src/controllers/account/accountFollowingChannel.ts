import { Request, Response } from "express";
import Joi from "joi";
import { AccountFollowingChannelService, AccountService } from "podverse-orm";
import { ensureAuthenticated, optionalEnsureAuthenticated } from "@api/lib/auth";
import { handleGenericErrorResponse } from "./helpers/error";
import { validateBodyObject, validateParamsObject } from "@api/lib/validation";
import { SharableStatusEnum } from "podverse-helpers";

const followChannelSchema = Joi.object({
  channel_id_text: Joi.string().required()
});

const getFollowedChannelsSchema = Joi.object({
  account_id_text: Joi.string().required()
});

class AccountFollowingChannelController {
  private static accountFollowingChannelService = new AccountFollowingChannelService();
  private static accountService = new AccountService();

  static async getFollowedChannels(req: Request, res: Response): Promise<void> {
    validateParamsObject(getFollowedChannelsSchema, req, res, async () => {
      optionalEnsureAuthenticated(req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { account_id_text } = req.params;
          const account = await AccountFollowingChannelController.accountService.getByIdText(account_id_text, { relations: ['sharable_status'] });
          if (!account) {
            return res.status(404).json({ message: 'Account not found' });
          }

          if (account.sharable_status.id === SharableStatusEnum.Private) {
            if (!jwtUser?.id || account.id !== jwtUser.id) {
              return res.status(404).json({ message: 'Account not found' });
            }
          }

          const followedChannels = await AccountFollowingChannelController
            .accountFollowingChannelService
            .getFollowedChannels(account.id, { relations: ['channel'] });
          res.json(followedChannels);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async followChannel(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(followChannelSchema, req, res, async () => {
        const account = req.user!;
        const { channel_id_text } = req.body;

        try {
          await AccountFollowingChannelController.accountFollowingChannelService.followChannel(account.id, channel_id_text);
          res.status(204).end();
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async unfollowChannel(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(followChannelSchema, req, res, async () => {
        const account = req.user!;
        const { channel_id_text } = req.body;

        try {
          await AccountFollowingChannelController.accountFollowingChannelService.unfollowChannel(account.id, channel_id_text);
          res.status(204).end();
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }
}

export { AccountFollowingChannelController };
