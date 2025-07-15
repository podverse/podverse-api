import { Router } from 'express';
import { config } from '@api/config';
import { AccountPayPalOrderController } from '@api/controllers/account/accountPayPalOrder';
import { asyncHandler } from '@api/middleware/asyncHandler';

const router = Router();

router.use(`${config.api.prefix}${config.api.version}/paypal`, router);

router.get('/:payment_id', asyncHandler(AccountPayPalOrderController.get));
router.post('/create', asyncHandler(AccountPayPalOrderController.create));
router.post('/webhooks/payment-completed', asyncHandler(AccountPayPalOrderController.completePayPalOrder));

export const accountPayPalOrderRouter = router;
