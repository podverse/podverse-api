import { Request, Response } from 'express';
import { PayPalService } from 'podverse-external-services';
import { AccountPayPalOrderService } from 'podverse-orm';
import { handleGenericErrorResponse } from './helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';

class AccountPayPalOrderController {
  private static payPalService = new PayPalService();
  private static accountPayPalOrderService = new AccountPayPalOrderService();

  static async get(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const jwtUser = req.user!;
        const { payment_id } = req.params;

        if (!payment_id) {
          res.status(400).json({ error: 'Payment ID is required' });
          return;
        }

        const accountPayPalOrder = await this.accountPayPalOrderService.get(jwtUser.id, payment_id);

        if (!accountPayPalOrder) {
          res.status(404).json({ error: 'PayPal Order not found' });
          return;
        }

        res.status(200).json(accountPayPalOrder);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const jwtUser = req.user!;
        const { payment_id, state } = req.body;

        if (!payment_id || !state) {
          res.status(400).json({ error: 'Invalid request body' });
          return;
        }

        const accountPayPalOrder = await this.accountPayPalOrderService.create(jwtUser.id, payment_id, state);
        res.status(201).json(accountPayPalOrder);
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }

  static async completePayPalOrder(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const { event_version, resource, resource_version } = req.body;
  
        if (!resource || !resource_version) {
          res.status(400).json({ error: 'Invalid request body' });
          return;
        }
  
        if (resource_version === '2.0') {
          const paymentID = resource.id;
          const capture = await this.payPalService.getCaptureInfo(paymentID);
          const { state } = capture;
          const isV2 = true;
          await this.accountPayPalOrderService.completePayPalOrder(paymentID, state, isV2);
        } else if (event_version === '1.0') {
          const paymentID = resource.parent_payment;
          const order = await this.payPalService.getPaymentInfo(paymentID);
          const { state } = order;
          const isV2 = false;
          await this.accountPayPalOrderService.completePayPalOrder(paymentID, state, isV2);
        }
  
        res.status(200).json({ message: 'Payment completed successfully' });
      } catch (err) {
        handleGenericErrorResponse(res, err);
      }
    });
  }
}

export { AccountPayPalOrderController };
