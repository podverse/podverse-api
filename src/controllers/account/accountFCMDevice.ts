import { Request, Response } from 'express';
import Joi from 'joi';
import { ACCOUNT_FCM_DEVICE_PLATFORM_VALUES, AccountFCMDevicePlatformValues } from 'podverse-helpers';
import { AccountFCMDeviceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { validateBodyObject } from '@api/lib/validation';
import { ensureAuthenticated } from '@api/lib/auth';

const createAccountFCMDeviceSchema = Joi.object({
  fcm_token: Joi.string().required(),
  installation_id: Joi.string().required(),
  platform: Joi.string().valid(...ACCOUNT_FCM_DEVICE_PLATFORM_VALUES).required(),
  locale: Joi.string().required()
});

const updateAccountFCMDeviceSchema = Joi.object({
  new_fcm_token: Joi.string().required(),
  installation_id: Joi.string().required(),
  previous_fcm_token: Joi.string().required().allow(null),
  platform: Joi.string().valid(...ACCOUNT_FCM_DEVICE_PLATFORM_VALUES).required(),
  locale: Joi.string().required()
});

const deleteAccountFCMDeviceSchema = Joi.object({
  fcm_token: Joi.string().required().allow(null),
  installation_id: Joi.string().required().allow(null),
});

const updateLocaleForAccountSchema = Joi.object({
  locale: Joi.string().required()
});

export class AccountFCMDeviceController {
  private static accountFCMDeviceService = new AccountFCMDeviceService();

  static async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(createAccountFCMDeviceSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { fcm_token, installation_id, platform, locale } = req.body as {
            fcm_token: string;
            installation_id: string;
            platform: AccountFCMDevicePlatformValues;
            locale: string;
          };
          const accountFCMDevice = await AccountFCMDeviceController
            .accountFCMDeviceService.create(jwtUser.id, {
              fcm_token,
              installation_id,
              platform,
              locale
            });
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
          const { previous_fcm_token, new_fcm_token, installation_id, platform, locale } = req.body as {
            new_fcm_token: string;
            installation_id: string;
            previous_fcm_token: string | null;
            platform: AccountFCMDevicePlatformValues;
            locale: string;
          };
          const accountFCMDevice = await AccountFCMDeviceController
            .accountFCMDeviceService.update(jwtUser.id, {
              new_fcm_token,
              installation_id,
              previous_fcm_token,
              platform,
              locale
            });
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
            fcm_token: string | null;
            installation_id: string | null;
          };
          await AccountFCMDeviceController
            .accountFCMDeviceService.delete(jwtUser.id, {
              fcm_token: fcm_token ?? null,
              installation_id: installation_id ?? null
            });
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

  static async updateLocaleForAccount(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(updateLocaleForAccountSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { locale } = req.body as { locale: string };
          await AccountFCMDeviceController.accountFCMDeviceService.updateLocaleForAccount(jwtUser.id, { locale });
          res.json({ message: 'Locale updated for account devices' });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }
}
