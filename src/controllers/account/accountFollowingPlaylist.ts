import { Request, Response } from "express";
import Joi from "joi";
import { AccountFollowingPlaylistService, AccountService } from "podverse-orm";
import { ensureAuthenticated, optionalEnsureAuthenticated } from "@api/lib/auth";
import { handleGenericErrorResponse } from "../helpers/error";
import { validateBodyObject, validateParamsObject } from "@api/lib/validation";
import { SharableStatusEnum } from "podverse-helpers";

const followPlaylistSchema = Joi.object({
  playlist_id_text: Joi.string().required()
});

const getFollowedPlaylistsSchema = Joi.object({
  account_id_text: Joi.string().required()
});

class AccountFollowingPlaylistController {
  private static accountFollowingPlaylistService = new AccountFollowingPlaylistService();
  private static accountService = new AccountService();

  static async getFollowedPlaylists(req: Request, res: Response): Promise<void> {
    validateParamsObject(getFollowedPlaylistsSchema, req, res, async () => {
      optionalEnsureAuthenticated(req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { account_id_text } = req.params;
          const account = await AccountFollowingPlaylistController.accountService.getByIdText(account_id_text, { relations: ['sharable_status'] });
          if (!account) {
            return res.status(404).json({ message: 'Account not found' });
          }

          if (account.sharable_status.id === SharableStatusEnum.Private) {
            if (!jwtUser?.id || account.id !== jwtUser.id) {
              return res.status(404).json({ message: 'Account not found' });
            }
          }

          if (account.id === jwtUser?.id) {
            const followedPlaylists = await AccountFollowingPlaylistController
              .accountFollowingPlaylistService
              .getFollowedPlaylistsPrivate(account.id, { relations: ['playlist'] });
            res.json(followedPlaylists);
          } else {
            const followedPlaylists = await AccountFollowingPlaylistController
              .accountFollowingPlaylistService
              .getFollowedPlaylistsPublic(account.id, { relations: ['playlist'] });
            res.json(followedPlaylists);
          }
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async followPlaylist(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(followPlaylistSchema, req, res, async () => {
        const account = req.user!;
        const { playlist_id_text } = req.body;

        try {
          await AccountFollowingPlaylistController.accountFollowingPlaylistService.followPlaylist(account.id, playlist_id_text);
          res.status(204).end();
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async unfollowPlaylist(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(followPlaylistSchema, req, res, async () => {
        const account = req.user!;
        const { playlist_id_text } = req.body;

        try {
          await AccountFollowingPlaylistController.accountFollowingPlaylistService.unfollowPlaylist(account.id, playlist_id_text);
          res.status(204).end();
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }
}

export { AccountFollowingPlaylistController };
