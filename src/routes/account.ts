import { Router } from 'express';
import { config } from '@api/config';
import { AccountController } from '@api/controllers/account';
import { AccountFollowingAccountController } from '@api/controllers/accountFollowingAccount';
import { AccountFollowingAddByRSSChannelController } from '@api/controllers/accountFollowingAddByRSSChannel';
import { AccountFollowingChannelController } from '@api/controllers/accountFollowingChannel';
import { asyncHandler } from '@api/middleware/asyncHandler';
import { AccountFollowingPlaylistController } from '@api/controllers/accountFollowingPlaylist';
import { AccountNotificationChannelController } from '@api/controllers/accountNotificationChannel';
import { AccountFCMDeviceController } from '@api/controllers/accountFCMDevice';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/account`, router);

router.get('/', asyncHandler(AccountController.getManyPublic));
router.get('/:id_text', asyncHandler(AccountController.getByIdText));

router.post('/', asyncHandler(AccountController.create));
router.put('/', asyncHandler(AccountController.update));
router.post('/send-verification-email', asyncHandler(AccountController.sendVerificationEmail));
router.post('/verify-email', asyncHandler(AccountController.verifyEmail));
router.post('/send-email-change-verification-email', asyncHandler(AccountController.sendEmailChangeVerificationEmail));
router.post('/verify-email-change', asyncHandler(AccountController.verifyEmailChange));
router.post('/send-reset-password-email', asyncHandler(AccountController.sendResetPasswordEmail));
router.post('/reset-password', asyncHandler(AccountController.resetPassword));
router.delete('/delete', asyncHandler(AccountController.delete));

router.post('/fcm-device/create', asyncHandler(AccountFCMDeviceController.create));
router.put('/fcm-device/update', asyncHandler(AccountFCMDeviceController.update));
router.delete('/fcm-device/delete', asyncHandler(AccountFCMDeviceController.delete));

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

router.get('/notification/channel/:channel_id_text', asyncHandler(AccountNotificationChannelController.getByAccountAndChannel));
router.get('/notification/channels', asyncHandler(AccountNotificationChannelController.getAllByAccount));
router.post('/notification/channel', asyncHandler(AccountNotificationChannelController.create));
router.delete('/notification/channel', asyncHandler(AccountNotificationChannelController.delete));

export const accountRouter = router;