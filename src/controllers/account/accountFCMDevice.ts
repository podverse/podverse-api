import { Request, Response } from 'express';
import Joi from 'joi';
import { AccountFCMDeviceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { validateBodyObject } from '@api/lib/validation';
import { ensureAuthenticated } from '@api/lib/auth';

const createAccountFCMDeviceSchema = Joi.object({
  fcm_token: Joi.string().required()
});

const updateAccountFCMDeviceSchema = Joi.object({
  previous_fcm_token: Joi.string().required(),
  new_fcm_token: Joi.string().required()
});

const deleteAccountFCMDeviceSchema = Joi.object({
  account_id: Joi.string().required(),
  fcm_token: Joi.string().required()
});

class AccountFCMDeviceController {
  private static accountFCMDeviceService = new AccountFCMDeviceService();

  static async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(createAccountFCMDeviceSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { fcm_token } = req.body;
          const accountFCMDevice = await AccountFCMDeviceController.accountFCMDeviceService.create(jwtUser.id, fcm_token);
          res.json(accountFCMDevice);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async update(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(updateAccountFCMDeviceSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { previous_fcm_token, new_fcm_token } = req.body;
          const accountFCMDevice = await AccountFCMDeviceController.accountFCMDeviceService.update(jwtUser.id, previous_fcm_token, new_fcm_token);
          res.json(accountFCMDevice);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async delete(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(deleteAccountFCMDeviceSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { fcm_token } = req.body;
          await AccountFCMDeviceController.accountFCMDeviceService.delete(jwtUser.id, fcm_token);
          res.json({ message: 'FCM device deleted successfully' });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }
}

export { AccountFCMDeviceController };