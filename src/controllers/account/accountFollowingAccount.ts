import { Request, Response } from "express";
import Joi from "joi";
import { AccountFollowingAccountService, AccountService } from "podverse-orm";
import { ensureAuthenticated, optionalEnsureAuthenticated } from "@api/lib/auth";
import { handleGenericErrorResponse } from "../helpers/error";
import { validateBodyObject, validateParamsObject } from "@api/lib/validation";
import { SharableStatusEnum } from "podverse-helpers";

const followAccountSchema = Joi.object({
  following_account_id_text: Joi.string().required()
});

const getFollowedAccountsSchema = Joi.object({
  account_id_text: Joi.string().required()
});

class AccountFollowingAccountController {
  private static accountFollowingAccountService = new AccountFollowingAccountService();
  private static accountService = new AccountService();

  static async getFollowedAccounts(req: Request, res: Response): Promise<void> {
    validateParamsObject(getFollowedAccountsSchema, req, res, async () => {
      optionalEnsureAuthenticated(req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { account_id_text } = req.params;

          const account = await AccountFollowingAccountController.accountService.getByIdText(account_id_text, { relations: ['sharable_status'] });

          if (!account) {
            return res.status(404).json({ message: 'Account not found' });
          }

          if (account.sharable_status.id === SharableStatusEnum.Private) {
            if (!jwtUser?.id || account.id !== jwtUser.id) {
              return res.status(404).json({ message: 'Account not found' });
            }
          }

          if (account.id === jwtUser?.id) {
            const followedPlaylists = await AccountFollowingAccountController
              .accountFollowingAccountService
              .getFollowedAccountsPrivate(account.id);
            res.json(followedPlaylists);
          } else {
            const followedPlaylists = await AccountFollowingAccountController
              .accountFollowingAccountService
              .getFollowedAccountsPublic(account.id);
            res.json(followedPlaylists);
          }
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      }, { skipMembershipStatus: true });
    });
  }

  static async followAccount(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(followAccountSchema, req, res, async () => {
        const account = req.user!;
        const { following_account_id_text } = req.body;

        try {
          await AccountFollowingAccountController.accountFollowingAccountService.followAccount(account.id, { following_account_id_text });
          res.status(201)
            .json({ message: 'Successfully followed account' });
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    }, { skipMembershipStatus: false });
  }

  static async unfollowAccount(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(followAccountSchema, req, res, async () => {
        const account = req.user!;
        const { following_account_id_text } = req.body;

        try {
          await AccountFollowingAccountController.accountFollowingAccountService.unfollowAccount(account.id, { following_account_id_text });
          res.status(204).end();
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    }, { skipMembershipStatus: true });
  }
}

export { AccountFollowingAccountController };
