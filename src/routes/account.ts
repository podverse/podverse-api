import { Router } from 'express';
import { config } from '@api/config';
import { AccountController } from '@api/controllers/account';
import { AccountFollowingAccountController } from '@api/controllers/accountFollowingAccount';
import { AccountFollowingAddByRSSChannelController } from '@api/controllers/accountFollowingAddByRSSChannel';
import { AccountFollowingChannelController } from '@api/controllers/accountFollowingChannel';
import { asyncHandler } from '@api/middleware/asyncHandler';
import { AccountFollowingPlaylistController } from '@api/controllers/accountFollowingPlaylist';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/account`, router);

router.get('/', asyncHandler(AccountController.getMany));
router.get('/:id_text', asyncHandler(AccountController.getByIdText));

router.post('/', asyncHandler(AccountController.create));
router.post('/send-verification-email', asyncHandler(AccountController.sendVerificationEmail));
router.post('/send-reset-password-email', asyncHandler(AccountController.sendResetPasswordEmail));
router.post('/verify-email', asyncHandler(AccountController.verifyEmail));
router.post('/reset-password', asyncHandler(AccountController.resetPassword));

router.post('/follow/account', asyncHandler(AccountFollowingAccountController.followAccount));
router.post('/unfollow/account', asyncHandler(AccountFollowingAccountController.unfollowAccount));
router.get('/:account_id_text/followed/accounts', asyncHandler(AccountFollowingAccountController.getFollowedAccounts));

router.post('/follow/add-by-rss-channel', asyncHandler(AccountFollowingAddByRSSChannelController.addOrUpdateRSSChannel));
router.post('/unfollow/add-by-rss-channel', asyncHandler(AccountFollowingAddByRSSChannelController.removeRSSChannel));
router.get('/:account_id_text/followed/add-by-rss-channels', asyncHandler(AccountFollowingAddByRSSChannelController.getFollowedAddByRSSChannels));

router.post('/follow/channel', asyncHandler(AccountFollowingChannelController.followChannel));
router.post('/unfollow/channel', asyncHandler(AccountFollowingChannelController.unfollowChannel));
router.get('/:account_id_text/followed/channels', asyncHandler(AccountFollowingChannelController.getFollowedChannels));

router.post('/follow/playlist', asyncHandler(AccountFollowingPlaylistController.followPlaylist));
router.post('/unfollow/playlist', asyncHandler(AccountFollowingPlaylistController.unfollowPlaylist));
router.get('/:account_id_text/followed/playlists', asyncHandler(AccountFollowingPlaylistController.getFollowedPlaylists));

export const accountRouter = router;
