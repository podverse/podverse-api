import { Router } from 'express';
import { config } from '@api/config';
import { AccountController } from '@api/controllers/account/account';
import { AccountFollowingAccountController } from '@api/controllers/account/accountFollowingAccount';
import { AccountFollowingAddByRSSChannelController } from '@api/controllers/account/accountFollowingAddByRSSChannel';
import { AccountFollowingChannelController } from '@api/controllers/account/accountFollowingChannel';
import { asyncHandler } from '@api/middleware/asyncHandler';
import { AccountFollowingPlaylistController } from '@api/controllers/account/accountFollowingPlaylist';
import { AccountNotificationChannelController } from '@api/controllers/account/accountNotificationChannel';
import { AccountFCMDeviceController } from '@api/controllers/account/accountFCMDevice';
import { rateLimitEndpoint } from '@api/lib/rateLimiter';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/account`, router);

router.get('/', asyncHandler(AccountController.getManyPublic));
router.get('/:id_text', asyncHandler(AccountController.getByIdText));

router.post('/', rateLimitEndpoint({ windowMs: 10 * 60 * 1000, max: 3 }), asyncHandler(AccountController.create));
router.put('/', asyncHandler(AccountController.update));
router.post('/send-verification-email', rateLimitEndpoint({ windowMs: 10 * 60 * 1000, max: 4 }), asyncHandler(AccountController.sendVerificationEmail));
router.post('/verify-email', rateLimitEndpoint({ windowMs: 10 * 60 * 1000, max: 10 }), asyncHandler(AccountController.verifyEmail));
router.post('/send-change-email-address-email', rateLimitEndpoint({ windowMs: 10 * 60 * 1000, max: 4 }), asyncHandler(AccountController.sendEmailChangeVerificationEmail));
router.post('/verify-email-change', rateLimitEndpoint({ windowMs: 10 * 60 * 1000, max: 10 }), asyncHandler(AccountController.verifyEmailChange));
router.post('/send-reset-password-email', rateLimitEndpoint({ windowMs: 10 * 60 * 1000, max: 4 }), asyncHandler(AccountController.sendResetPasswordEmail));
router.post('/reset-password', rateLimitEndpoint({ windowMs: 10 * 60 * 1000, max: 4 }), asyncHandler(AccountController.resetPassword));
router.delete('/delete', asyncHandler(AccountController.delete));

router.post('/fcm-device/create', asyncHandler(AccountFCMDeviceController.create));
router.put('/fcm-device/update', asyncHandler(AccountFCMDeviceController.update));
router.delete('/fcm-device/delete', asyncHandler(AccountFCMDeviceController.delete));

router.post('/follow/account', asyncHandler(AccountFollowingAccountController.followAccount));
router.post('/unfollow/account', asyncHandler(AccountFollowingAccountController.unfollowAccount));

router.post('/follow/add-by-rss-channel', asyncHandler(AccountFollowingAddByRSSChannelController.addOrUpdateRSSChannel));
router.post('/unfollow/add-by-rss-channel', asyncHandler(AccountFollowingAddByRSSChannelController.removeRSSChannel));

router.post('/follow/channel', asyncHandler(AccountFollowingChannelController.followChannel));
router.post('/unfollow/channel', asyncHandler(AccountFollowingChannelController.unfollowChannel));

router.post('/follow/playlist', asyncHandler(AccountFollowingPlaylistController.followPlaylist));
router.post('/unfollow/playlist', asyncHandler(AccountFollowingPlaylistController.unfollowPlaylist));

router.get('/notification/channel/:channel_id_text', asyncHandler(AccountNotificationChannelController.getByAccountAndChannel));
router.get('/notification/channels', asyncHandler(AccountNotificationChannelController.getAllByAccount));
router.post('/notification/channel', asyncHandler(AccountNotificationChannelController.create));
router.delete('/notification/channel/:channel_id_text', asyncHandler(AccountNotificationChannelController.delete));

export const accountRouter = router;