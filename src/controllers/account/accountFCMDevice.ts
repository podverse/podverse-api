import { Request, Response } from 'express';
import Joi from 'joi';
import { AccountFCMDeviceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { validateBodyObject } from '@api/lib/validation';
import { ensureAuthenticated } from '@api/lib/auth';

const createAccountFCMDeviceSchema = Joi.object({
  fcm_token: Joi.string().required(),
  installation_id: Joi.string().required()
});

const updateAccountFCMDeviceSchema = Joi.object({
  installation_id: Joi.string().required().allow(null),
  new_fcm_token: Joi.string().required(),
  previous_fcm_token: Joi.string().required().allow(null),
});

const deleteAccountFCMDeviceSchema = Joi.object({
  fcm_token: Joi.string().required().allow(null),
  installation_id: Joi.string().required().allow(null),
});

export class AccountFCMDeviceController {
  private static accountFCMDeviceService = new AccountFCMDeviceService();

  static async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(createAccountFCMDeviceSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { fcm_token, installation_id } = req.body;
          const accountFCMDevice = await AccountFCMDeviceController
            .accountFCMDeviceService.create(jwtUser.id, fcm_token, installation_id);
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
          const { previous_fcm_token, new_fcm_token, installation_id } = req.body as {
            previous_fcm_token: string | null;
            new_fcm_token: string;
            installation_id: string | null;
          };
          const accountFCMDevice = await AccountFCMDeviceController
            .accountFCMDeviceService.update(jwtUser.id, new_fcm_token, installation_id, previous_fcm_token);
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
          const { fcm_token, installation_id } = req.body as {
            fcm_token?: string;
            installation_id?: string;
          };
          await AccountFCMDeviceController
            .accountFCMDeviceService.delete(jwtUser.id, fcm_token, installation_id);
          res.json({ message: 'FCM device deleted successfully' });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async getAllForAccount(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const jwtUser = req.user!;
        const devices = await AccountFCMDeviceController.accountFCMDeviceService.getAllForAccount(jwtUser.id);
        res.json(devices);
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }
}
