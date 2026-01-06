import { Router } from 'express';
import { AccountSettingsLocaleController } from '@api/controllers/account/accountSettings/accountSettingsLocale';
import { AccountSettingsNotificationTypeController } from '@api/controllers/account/accountSettings/accountSettingsNotificationType';
import { asyncHandler } from '@api/middleware/asyncHandler';
import { config } from '@api/config';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/account-settings`, router);

router.patch('/locale', asyncHandler(AccountSettingsLocaleController.update));

router.post('/notification-type', asyncHandler(AccountSettingsNotificationTypeController.create));
router.delete('/notification-type', asyncHandler(AccountSettingsNotificationTypeController.delete));

export const accountSettingsRouter = router;
