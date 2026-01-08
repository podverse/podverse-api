import { Request, Response } from 'express';
import Joi from 'joi';
import { AccountUPDeviceService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { validateBodyObject } from '@api/lib/validation';
import { ensureAuthenticated } from '@api/lib/auth';

const createAccountUPDeviceSchema = Joi.object({
  up_endpoint: Joi.string().uri().required(),
  up_auth_key: Joi.string().required().allow(null)
});

const updateAccountUPDeviceSchema = Joi.object({
  up_endpoint: Joi.string().uri().required(),
  up_auth_key: Joi.string().required().allow(null)
});

const deleteAccountUPDeviceSchema = Joi.object({
  up_endpoint: Joi.string().uri().required()
});

const updateLocaleForAccountSchema = Joi.object({
  locale: Joi.string().required()
});

export class AccountUPDeviceController {
  private static accountUPDeviceService = new AccountUPDeviceService();

  static async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(createAccountUPDeviceSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { up_endpoint, up_auth_key } = req.body as {
            up_endpoint: string;
            up_auth_key: string | null;
          };
          const accountUPDevice = await AccountUPDeviceController
            .accountUPDeviceService.create(jwtUser.id, {
              up_endpoint,
              up_auth_key
            });
          res.json(accountUPDevice);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async update(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(updateAccountUPDeviceSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { up_endpoint, up_auth_key } = req.body as {
            up_endpoint: string;
            up_auth_key: string | null;
          };
          const accountUPDevice = await AccountUPDeviceController
            .accountUPDeviceService.update(jwtUser.id, {
              up_endpoint,
              up_auth_key
            });
          res.json(accountUPDevice);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async delete(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(deleteAccountUPDeviceSchema, req, res, async () => {
        try {
          const jwtUser = req.user!;
          const { up_endpoint } = req.body as {
            up_endpoint: string;
          };
          await AccountUPDeviceController
            .accountUPDeviceService.delete(jwtUser.id, {
              up_endpoint
            });
          res.json({ message: 'UP device deleted successfully' });
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
        const devices = await AccountUPDeviceController.accountUPDeviceService.getAllForAccount(jwtUser.id);
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
          await AccountUPDeviceController.accountUPDeviceService.updateLocaleForAccount(jwtUser.id, { locale });
          res.json({ message: 'Locale updated for account devices' });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async deleteAllForAccount(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const jwtUser = req.user!;
        await AccountUPDeviceController.accountUPDeviceService.deleteAllForAccount(jwtUser.id);
        res.json({ message: 'All UP devices deleted successfully' });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }
}
