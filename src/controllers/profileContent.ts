import { Request, Response } from 'express';
import Joi from 'joi';
import { ApiListResponse, getSharableStatusIdsForProfileType } from 'podverse-helpers';
import {
  AccountFollowingChannel,
  AccountFollowingChannelService,
  AccountService,
  Channel,
  Clip,
  ClipService,
  FindManyOptions,
  Playlist,
  PlaylistService,
  subChannelGetManyRelations
} from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams } from '@api/controllers/helpers/pagination';
import { validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { ensureAuthenticated } from '@api/lib/auth';
import { getParamRequired } from '@api/lib/params';

const getByAccountIdTextSchema = Joi.object({
  account_id_text: Joi.string().required()
});

const getPaginatedSchema = Joi.object({
  page: Joi.number().integer().min(1).required()
});

const clipRelations = [
  'item',
  'item.item_enclosures',
  'item.item_enclosures.item_enclosure_sources',
  'item.item_images',
  'item.channel',
  'item.channel.channel_images',
  'account',
  'account.account_profile',
  'sharable_status'
];

const playlistRelations = [
  'account',
  'account.account_profile'
];

export class ProfileContentController {
  private static accountService = new AccountService();
  private static accountFollowingChannelService = new AccountFollowingChannelService();
  private static clipService = new ClipService();
  private static playlistService = new PlaylistService();

  // Public profile routes - require account_id_text param

  static async getProfilePodcastsAZ(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByAccountIdTextSchema, req, res, async () => {
      validateQueryObject(getPaginatedSchema, req, res, async () => {
        try {
          const account_id_text = getParamRequired(req, 'account_id_text');
          const { page, limit, offset } = getPaginationParams(req);

          // Check if account exists and is public/unlisted
          const account = await ProfileContentController.accountService.getByIdText(
            account_id_text,
            { relations: ['sharable_status'] }
          );

          if (!account) {
            return res.status(404).json({ message: 'Account not found' });
          }

          const sharableStatusIds = getSharableStatusIdsForProfileType('subscribed');
          if (!sharableStatusIds.includes(account.sharable_status.id)) {
            return res.status(404).json({ message: 'Account not found' });
          }

          const config: FindManyOptions<AccountFollowingChannel> = {
            skip: offset,
            take: limit,
            relations: subChannelGetManyRelations,
            order: { channel: { sortable_title: 'ASC' } }
          };

          const { results, count } = await ProfileContentController.accountFollowingChannelService
            .getFollowedChannelsByAccountIdTextWithCount(account_id_text, 'av', config);
          
          const channels = results.map((f: AccountFollowingChannel) => f.channel).filter(Boolean);

          const response: ApiListResponse<Channel> = {
            data: channels,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async getProfilePlaylistsAZ(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByAccountIdTextSchema, req, res, async () => {
      validateQueryObject(getPaginatedSchema, req, res, async () => {
        try {
          const account_id_text = getParamRequired(req, 'account_id_text');
          const { page, limit, offset } = getPaginationParams(req);

          // Check if account exists and is public/unlisted
          const account = await ProfileContentController.accountService.getByIdText(
            account_id_text,
            { relations: ['sharable_status'] }
          );

          if (!account) {
            return res.status(404).json({ message: 'Account not found' });
          }

          const sharableStatusIds = getSharableStatusIdsForProfileType('subscribed');
          if (!sharableStatusIds.includes(account.sharable_status.id)) {
            return res.status(404).json({ message: 'Account not found' });
          }

          const config: FindManyOptions<Playlist> = {
            skip: offset,
            take: limit,
            relations: playlistRelations,
            order: { title: 'ASC' }
          };

          const [playlists, count] = await ProfileContentController.playlistService
            .getManyByAccountIdTextPublicAndCount(account_id_text, config);

          const response: ApiListResponse<Playlist> = {
            data: playlists,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async getProfileClipsRecent(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByAccountIdTextSchema, req, res, async () => {
      validateQueryObject(getPaginatedSchema, req, res, async () => {
        try {
          const account_id_text = getParamRequired(req, 'account_id_text');
          const { page, limit, offset } = getPaginationParams(req);

          // Check if account exists and is public/unlisted
          const account = await ProfileContentController.accountService.getByIdText(
            account_id_text,
            { relations: ['sharable_status'] }
          );

          if (!account) {
            return res.status(404).json({ message: 'Account not found' });
          }

          const sharableStatusIds = getSharableStatusIdsForProfileType('subscribed');
          if (!sharableStatusIds.includes(account.sharable_status.id)) {
            return res.status(404).json({ message: 'Account not found' });
          }

          const config: FindManyOptions<Clip> = {
            skip: offset,
            take: limit,
            relations: clipRelations,
            order: { created_at: 'DESC' }
          };

          const [clips, count] = await ProfileContentController.clipService
            .getManyByAccountIdTextPublicAndCount(account_id_text, config);

          const response: ApiListResponse<Clip> = {
            data: clips,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async getProfileAlbumsAZ(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByAccountIdTextSchema, req, res, async () => {
      validateQueryObject(getPaginatedSchema, req, res, async () => {
        try {
          const account_id_text = getParamRequired(req, 'account_id_text');
          const { page, limit, offset } = getPaginationParams(req);

          // Check if account exists and is public/unlisted
          const account = await ProfileContentController.accountService.getByIdText(
            account_id_text,
            { relations: ['sharable_status'] }
          );

          if (!account) {
            return res.status(404).json({ message: 'Account not found' });
          }

          const sharableStatusIds = getSharableStatusIdsForProfileType('subscribed');
          if (!sharableStatusIds.includes(account.sharable_status.id)) {
            return res.status(404).json({ message: 'Account not found' });
          }

          const config: FindManyOptions<AccountFollowingChannel> = {
            skip: offset,
            take: limit,
            relations: subChannelGetManyRelations,
            order: { channel: { sortable_title: 'ASC' } }
          };

          const { results, count } = await ProfileContentController.accountFollowingChannelService
            .getFollowedChannelsByAccountIdTextWithCount(account_id_text, 'music', config);
          
          const channels = results.map((f: AccountFollowingChannel) => f.channel).filter(Boolean);

          const response: ApiListResponse<Channel> = {
            data: channels,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  // My profile routes - use JWT for account

  static async getMyProfilePodcastsAZ(req: Request, res: Response): Promise<void> {
    validateQueryObject(getPaginatedSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const account = req.user!;
          const { page, limit, offset } = getPaginationParams(req);

          const config: FindManyOptions<AccountFollowingChannel> = {
            skip: offset,
            take: limit,
            relations: subChannelGetManyRelations,
            order: { channel: { sortable_title: 'ASC' } }
          };

          const { results, count } = await ProfileContentController.accountFollowingChannelService
            .getFollowedChannelsWithCount(account.id, 'av', config);
          
          const channels = results.map((f: AccountFollowingChannel) => f.channel).filter(Boolean);

          const response: ApiListResponse<Channel> = {
            data: channels,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      }, { skipMembershipStatus: true });
    });
  }

  static async getMyProfilePlaylistsAZ(req: Request, res: Response): Promise<void> {
    validateQueryObject(getPaginatedSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const account = req.user!;
          const { page, limit, offset } = getPaginationParams(req);

          const config: FindManyOptions<Playlist> = {
            skip: offset,
            take: limit,
            relations: playlistRelations,
            order: { title: 'ASC' }
          };

          // Content must be public even for my-profile
          const [playlists, count] = await ProfileContentController.playlistService
            .getManyByAccountIdTextPublicAndCount(account.id_text, config);

          const response: ApiListResponse<Playlist> = {
            data: playlists,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      }, { skipMembershipStatus: true });
    });
  }

  static async getMyProfileClipsRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getPaginatedSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const account = req.user!;
          const { page, limit, offset } = getPaginationParams(req);

          const config: FindManyOptions<Clip> = {
            skip: offset,
            take: limit,
            relations: clipRelations,
            order: { created_at: 'DESC' }
          };

          // Content must be public even for my-profile
          const [clips, count] = await ProfileContentController.clipService
            .getManyByAccountIdTextPublicAndCount(account.id_text, config);

          const response: ApiListResponse<Clip> = {
            data: clips,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      }, { skipMembershipStatus: true });
    });
  }

  static async getMyProfileAlbumsAZ(req: Request, res: Response): Promise<void> {
    validateQueryObject(getPaginatedSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const account = req.user!;
          const { page, limit, offset } = getPaginationParams(req);

          const config: FindManyOptions<AccountFollowingChannel> = {
            skip: offset,
            take: limit,
            relations: subChannelGetManyRelations,
            order: { channel: { sortable_title: 'ASC' } }
          };

          const { results, count } = await ProfileContentController.accountFollowingChannelService
            .getFollowedChannelsWithCount(account.id, 'music', config);
          
          const channels = results.map((f: AccountFollowingChannel) => f.channel).filter(Boolean);

          const response: ApiListResponse<Channel> = {
            data: channels,
            meta: { page, count, limit }
          };
          res.json(response);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      }, { skipMembershipStatus: true });
    });
  }
}
