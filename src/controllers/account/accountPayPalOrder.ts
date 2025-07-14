import { Request, Response } from 'express';
import Joi from 'joi';
import { AccountPayPalOrderService } from 'podverse-orm';
import { handleGenericErrorResponse } from '../helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';
import { paypalService } from '@api/factories/paypalService';

const getPayPalOrderSchema = Joi.object({
  payment_id: Joi.string().required()
});

const createPayPalOrderSchema = Joi.object({
  payment_id: Joi.string().required(),
  state: Joi.string().required()
});

const completePayPalOrderSchema = Joi.object({
  event_version: Joi.string().optional(),
  resource: Joi.object({
    id: Joi.string().optional(),
    parent_payment: Joi.string().optional()
  }).required(),
  resource_version: Joi.string().required()
});

class AccountPayPalOrderController {
  private static accountPayPalOrderService = new AccountPayPalOrderService();

  static async get(req: Request, res: Response): Promise<void> {
    validateParamsObject(getPayPalOrderSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { payment_id } = req.params;

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
    });
  }

  static async create(req: Request, res: Response): Promise<void> {
    validateBodyObject(createPayPalOrderSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { payment_id, state } = req.body;

          const accountPayPalOrder = await this.accountPayPalOrderService.create(jwtUser.id, payment_id, state);
          res.status(201).json(accountPayPalOrder);
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }

  static async completePayPalOrder(req: Request, res: Response): Promise<void> {
    validateBodyObject(completePayPalOrderSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const { event_version, resource, resource_version } = req.body;

          if (resource_version === '2.0') {
            const paymentID = resource.id;
            const capture = await paypalService.getCaptureInfo(paymentID);
            const { state } = capture;
            const isV2 = true;
            await this.accountPayPalOrderService.completePayPalOrder(paymentID, state, isV2);
          } else if (event_version === '1.0') {
            const paymentID = resource.parent_payment;
            const order = await paypalService.getPaymentInfo(paymentID);
            const { state } = order;
            const isV2 = false;
            await this.accountPayPalOrderService.completePayPalOrder(paymentID, state, isV2);
          }

          res.status(200).json({ message: 'Payment completed successfully' });
        } catch (err) {
          handleGenericErrorResponse(res, err);
        }
      });
    });
  }
}

export { AccountPayPalOrderController };
