import { Request, Response } from 'express';
import Joi from 'joi';
import { ERROR_MESSAGES, SharableStatusEnum } from 'podverse-helpers';
import { AccountCredentialsService, AccountEmailChangeVerificationService,
  AccountResetPasswordService, AccountService, AccountVerificationService } from 'podverse-orm';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@api/config';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams } from '@api/controllers/helpers/pagination';
import { ensureAuthenticated } from '@api/lib/auth/';
import { sendVerificationEmail } from '@api/lib/mailer/sendVerificationEmail';
import { sendResetPasswordEmail } from '@api/lib/mailer/sendResetPasswordEmail';
import { validateBodyObject, validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { sendEmailChangeVerificationEmail } from '@api/lib/mailer/sendChangeEmailVerificationEmail';

const createAccountSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  locale: Joi.string().required()
});

const updateAccountSchema = Joi.object({
  display_name: Joi.string().optional(),
  bio: Joi.string().optional(),
  sharable_status: Joi.number().valid(...Object.values(SharableStatusEnum)).required(),
  locale: Joi.string().required()
});

const sendVerificationEmailSchema = Joi.object({
  email: Joi.string().email().required()
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

const verifyEmailChangeSchema = Joi.object({
  token: Joi.string().required()
});

const sendEmailChangeVerificationSchema = Joi.object({
  new_email: Joi.string().email().required()
});

const sendResetPasswordEmailSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required()
});

const getByIdTextSchema = Joi.object({
  id_text: Joi.string().required()
});

const publicRelations = [
  'account_following_channels',
  'account_profile',
];

const privateRelations = [
  // 'account_app_store_purchases',
  'account_credentials',
  // 'account_fcm_devices',
  'account_following_accounts',
  'account_following_add_by_rss_channels',
  'account_following_playlists',
  // 'account_google_play_purchases',
  'account_membership_status',
  'account_membership_status.account_membership',
  'account_notification_channels',
  'account_notification_channels.account_notification_channel_types',
  // 'account_paypal_orders',
  // 'account_reset_password',
  'account_settings',
  'account_settings.account_settings_notification',
  'account_settings.account_settings_notification.account_settings_notification_types',
  // 'account_up_device_tokens',
  // 'account_up_devices',
  // 'account_verification'
];

export class AccountController {
  private static accountService = new AccountService();
  private static accountCredentialsService = new AccountCredentialsService();
  private static accountEmailChangeVerificationService = new AccountEmailChangeVerificationService();
  private static accountResetPasswordService = new AccountResetPasswordService();
  private static accountVerificationService = new AccountVerificationService();

  static async getByIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByIdTextSchema, req, res, async () => {
      try {
        const { id_text } = req.params;
        // TODO: Only return if is a public account
        const config = { relations: publicRelations };
        const data = await AccountController.accountService.getByIdText(id_text, config);
        handleReturnDataOrNotFound(res, data, 'Account');
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getLoggedInAccount(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const account_id = req.user!.id;

        const data = await AccountController.accountService.get(account_id, { relations: [
          ...publicRelations,
          ...privateRelations
        ] });

        if (data?.account_credentials) {
          delete data.account_credentials.password;
        }

        handleReturnDataOrNotFound(res, data, 'Account');
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async checkIfValidAuthSession(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      res.json({
        message: 'Valid auth session'
      });
    });
  }

  static async getManyPublic(req: Request, res: Response): Promise<void> {
    const getManyPublicSchema = Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).optional()
    });

    validateQueryObject(getManyPublicSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const channels = await AccountController.accountService.getMany({
          skip: offset,
          take: limit,
          relations: publicRelations,
          where: {
            sharable_status: { id: SharableStatusEnum.Public }
          }
        });

        res.json({
          data: channels,
          meta: {
            page
          }
        });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async create(req: Request, res: Response): Promise<void> {
    validateBodyObject(createAccountSchema, req, res, async () => {
      try {
        const { email, password, locale } = req.body as { email: string; password: string, locale: string };
        await AccountController.accountService.create({ email, password, locale });
        await AccountController.sendVerificationEmailHelper(email);
        res.json({
          message: 'Account created'
        });
      } catch (error) {
        if (error instanceof Error && error.message === ERROR_MESSAGES.ACCOUNT.ALREADY_EXISTS) {
          res.json({
            message: 'Account created'
          });
        } else {
          handleGenericErrorResponse(res, error);
        }
      }
    });
  }

  static async update(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(updateAccountSchema, req, res, async () => {
        try {
          const account_id = req.user!.id;
          const dto = req.body as {
            display_name?: string;
            bio?: string;
            sharable_status: SharableStatusEnum,
            locale: string
          };
          
          const updatedAccount = await AccountController.accountService.update(account_id, dto);
          res.json(updatedAccount);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  static async sendVerificationEmail(req: Request, res: Response): Promise<void> {
    validateBodyObject(sendVerificationEmailSchema, req, res, async () => {
      try {
        const { email } = req.body;
        await AccountController.sendVerificationEmailHelper(email);
        res.json({
          message: 'Verification email sent'
        });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  private static async sendVerificationEmailHelper(email: string): Promise<void> {
    const account = await AccountController.accountService.getByEmail(email);

    if (!account) {
      console.warn('[AccountController.sendVerificationEmailHelper] account not found', { email });
      throw new Error('Account not found.');
    }

    const verificationToken = uuidv4();
    const verificationTokenExpiresAt = new Date(Date.now() + config.verifyEmail.tokenExpiration);

    await AccountController.accountVerificationService.update(account, {
      verification_token: verificationToken,
      verification_token_expires_at: verificationTokenExpiresAt
    });

    await sendVerificationEmail(email, account.id_text, verificationToken);
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    validateBodyObject(verifyEmailSchema, req, res, async () => {
      try {
        const { token } = req.body;
        const accountVerification = await AccountController.accountVerificationService.getByToken(token);

        if (!accountVerification) {
          res.status(400).json({ message: 'Invalid or expired verification token' });
          return;
        }

        await AccountController.accountService.verifyEmail(accountVerification.account.id);

        res.json({ message: 'Email verified successfully' });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async sendEmailChangeVerificationEmail(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateBodyObject(sendEmailChangeVerificationSchema, req, res, async () => {
        try {
          const account_id = req.user!.id;
          const { new_email } = req.body;

          await AccountController.sendEmailChangeVerificationEmailHelper(account_id, new_email);
          res.json({
            message: 'Email change verification email sent'
          });
        } catch (error) {
          console.error('[AccountController.sendEmailChangeVerificationEmail] error', error);
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }

  private static async sendEmailChangeVerificationEmailHelper(account_id: number, pending_email_address: string): Promise<void> {
    const account = await AccountController.accountService.get(account_id, { relations: ['account_credentials'] });
    if (!account) {
      console.warn('[AccountController.sendEmailChangeVerificationEmailHelper] account not found', { account_id });
      throw new Error('Account not found.');
    }
  
    const verificationToken = uuidv4();
    const verificationTokenExpiresAt = new Date(Date.now() + config.emailChangeVerification.tokenExpiration);
  
    await AccountController.accountEmailChangeVerificationService.create(account, {
      verification_token: verificationToken,
      verification_token_expires_at: verificationTokenExpiresAt,
      pending_email_address
    });
    
    await sendEmailChangeVerificationEmail(pending_email_address, verificationToken);
  }

  static async verifyEmailChange(req: Request, res: Response): Promise<void> {
    validateBodyObject(verifyEmailChangeSchema, req, res, async () => {
      try {
        const { token } = req.body;
        const accountEmailChangeVerification = await AccountController
          .accountEmailChangeVerificationService.getByToken(token);
  
        if (!accountEmailChangeVerification) {
          res.status(400).json({ message: 'Invalid or expired verification token' });
          return;
        }

        const dto = {
          email: accountEmailChangeVerification.pending_email_address
        };
  
        await AccountController.accountCredentialsService.update(
          accountEmailChangeVerification.account,
          dto
        );

        await AccountController.accountEmailChangeVerificationService.deleteByAccountId(
          accountEmailChangeVerification.account.id);
  
        res.json({ message: 'Email change verified successfully' });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async sendResetPasswordEmail(req: Request, res: Response): Promise<void> {
    validateBodyObject(sendResetPasswordEmailSchema, req, res, async () => {
      try {
        const { email } = req.body;
        await AccountController.sendResetPasswordEmailHelper(email);
        res.json({
          message: 'Reset password email sent'
        });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  private static async sendResetPasswordEmailHelper(email: string): Promise<void> {
    const account = await AccountController.accountService.getByEmail(email);

    if (!account) {
      throw new Error('Account not found.');
    }

    const resetToken = uuidv4();
    const resetTokenExpiresAt = new Date(Date.now() + config.resetPassword.tokenExpiration);

    await AccountController.accountResetPasswordService.update(account, {
      reset_token: resetToken,
      reset_token_expires_at: resetTokenExpiresAt
    });

    await sendResetPasswordEmail(email, account.id_text, resetToken);
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    validateBodyObject(resetPasswordSchema, req, res, async () => {
      try {
        const { token, password } = req.body;
        const accountResetPassword = await AccountController.accountResetPasswordService.getByToken(token);

        if (!accountResetPassword) {
          res.status(400).json({ message: 'Invalid or expired reset password token' });
          return;
        }

        await AccountController.accountService.resetPassword(accountResetPassword.account.id, password);

        res.json({ message: 'Password reset successfully' });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async delete(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      try {
        const account_id = req.user!.id;
        await AccountController.accountService.delete(account_id);
        res.json({ message: 'Account deleted successfully' });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }
}
