import { Request, Response } from 'express';
import Joi from 'joi';
import { ERROR_MESSAGES, SharableStatusEnum, getSharableStatusIdsForProfileType, QueryParamsStatsRange, QUERY_PARAMS_STATS_RANGE_VALUES } from 'podverse-helpers';
import { AccountCredentialsService, AccountEmailChangeVerificationService,
  AccountResetPasswordService, AccountService, AccountVerificationService, AccountFollowingAccountService,
  StatsAggregatedAccountService, FindManyOptions, StatsAggregatedAccount, Account, AccountFollowingAccount } from 'podverse-orm';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@api/config';
import { handleReturnDataOrNotFound } from '@api/controllers/helpers/data';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { getPaginationParams } from '@api/controllers/helpers/pagination';
import { ensureAuthenticated, optionalEnsureAuthenticated } from '@api/lib/auth/';
import { sendVerificationEmail } from '@api/lib/mailer/sendVerificationEmail';
import { sendResetPasswordEmail } from '@api/lib/mailer/sendResetPasswordEmail';
import { validateBodyObject, validateParamsObject, validateQueryObject } from '@api/lib/validation';
import { sendEmailChangeVerificationEmail } from '@api/lib/mailer/sendChangeEmailVerificationEmail';
import { getParamRequired } from '@api/lib/params';
import { getStatsOrder } from '@api/lib/stats';
import { getFollowedAccountIds } from '@api/lib/followed';

const createAccountSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  locale: Joi.string().required()
});

const updateAccountSchema = Joi.object({
  display_name: Joi.string().allow(null).required(),
  bio: Joi.string().allow(null).required(),
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

const getManyPublicRecentSchema = Joi.object({
  page: Joi.number().integer().min(1).required()
});

const getManyPublicTopSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required()
});

const getManySubscribedAZSchema = Joi.object({
  page: Joi.number().integer().min(1).required()
});

const getManySubscribedRecentSchema = Joi.object({
  page: Joi.number().integer().min(1).required()
});

const getManySubscribedTopSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  range: Joi.string().valid(...QUERY_PARAMS_STATS_RANGE_VALUES).required()
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

const subAccountGetManyRelations = [
  'tracked_account',
  'tracked_account.account_profile',
  'tracked_account.sharable_status'
];

export class AccountController {
  private static accountService = new AccountService();
  private static accountCredentialsService = new AccountCredentialsService();
  private static accountEmailChangeVerificationService = new AccountEmailChangeVerificationService();
  private static accountResetPasswordService = new AccountResetPasswordService();
  private static accountVerificationService = new AccountVerificationService();
  private static accountFollowingAccountService = new AccountFollowingAccountService();
  private static statsAggregatedAccountService = new StatsAggregatedAccountService();

  static async getByIdText(req: Request, res: Response): Promise<void> {
    validateParamsObject(getByIdTextSchema, req, res, async () => {
      optionalEnsureAuthenticated(req, res, async () => {
        try {
          const id_text = getParamRequired(req, 'id_text');
          const jwtUser = req.user;
          
          const config = { relations: [...publicRelations, 'sharable_status'] };
          const data = await AccountController.accountService.getByIdText(id_text, config);
          
          if (!data) {
            handleReturnDataOrNotFound(res, null, 'Account');
            return;
          }

          // If user is viewing their own account, return it (even if private)
          if (jwtUser?.id && data.id === jwtUser.id) {
            // User is viewing their own profile via public link - frontend will redirect
            handleReturnDataOrNotFound(res, data, 'Account');
            return;
          }

          // For non-owners, only return if public or unlisted
          const sharableStatusIds = getSharableStatusIdsForProfileType('subscribed');
          if (!sharableStatusIds.includes(data.sharable_status.id)) {
            // Private account, return not found
            handleReturnDataOrNotFound(res, null, 'Account');
            return;
          }

          // Remove private data before returning
          const cleanedAccount = AccountController.removePrivateInformation(data);
          handleReturnDataOrNotFound(res, cleanedAccount, 'Account');
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      }, { skipMembershipStatus: true });
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
    }, { skipMembershipStatus: true });
  }

  static async checkIfValidAuthSession(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      res.json({
        message: 'Valid auth session'
      });
    }, { skipMembershipStatus: true });
  }

  static async getManyPublicRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyPublicRecentSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);

        // Fetch accounts with public sharable status, sorted by newest first
        const accounts = await AccountController.accountService.getManyPublic({
          order: { id: 'DESC' },
          skip: offset,
          take: limit,
          relations: [...publicRelations, 'sharable_status']
        });

        // Remove private information from accounts before returning
        const filteredAccounts = accounts.map(account => AccountController.removePrivateInformation(account));

        res.json({
          data: filteredAccounts,
          meta: {
            page,
            count: null,
            limit
          }
        });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getManySubscribedAZ(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySubscribedAZSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const account_id = req.user!.id;

          let accounts: Account[] = [];
          let count = 0;

          // Get the account entity first
          const account = await AccountController.accountService.get(account_id);
          if (!account) {
            res.json({
              data: [],
              meta: {
                page,
                count: 0,
                limit
              }
            });
            return;
          }

          // Get followed accounts with alphabetical ordering
          const order: FindManyOptions<AccountFollowingAccount>['order'] = { 
            following_account: { account_profile: { display_name: 'ASC' } } 
          };
          const config: FindManyOptions<AccountFollowingAccount> = {
            skip: offset,
            take: limit,
            relations: [
              'following_account',
              'following_account.account_profile',
              'following_account.sharable_status'
            ],
            order,
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { results: followedResults, count: followedCount } = await (AccountController.accountFollowingAccountService as any)
            ._getAllWithCount(account, config);
          
          count = followedCount;
          accounts = followedResults
            .map((fa: AccountFollowingAccount) => fa.following_account)
            .filter((account: Account | undefined): account is Account => 
              account !== undefined && account.account_profile?.display_name !== null
            );

          // Filter by sharable status
          const sharableStatusIds = getSharableStatusIdsForProfileType('subscribed');
          accounts = accounts.filter(account => sharableStatusIds.includes(account.sharable_status.id));

          // Remove private information from accounts before returning
          const filteredAccounts = accounts.map(account => AccountController.removePrivateInformation(account));

          res.json({
            data: filteredAccounts,
            meta: {
              page,
              count,
              limit
            }
          });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      }, { skipMembershipStatus: true });
    });
  }

  static async getManySubscribedRecent(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySubscribedRecentSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const account_id = req.user!.id;

          let accounts: Account[] = [];
          let count = 0;

          // Get the account entity first
          const account = await AccountController.accountService.get(account_id);
          if (!account) {
            res.json({
              data: [],
              meta: {
                page,
                count: 0,
                limit
              }
            });
            return;
          }

          // Get followed accounts sorted by newest first
          const order: FindManyOptions<AccountFollowingAccount>['order'] = { 
            following_account: { id: 'DESC' } 
          };
          const config: FindManyOptions<AccountFollowingAccount> = {
            skip: offset,
            take: limit,
            relations: [
              'following_account',
              'following_account.account_profile',
              'following_account.sharable_status'
            ],
            order,
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { results: followedResults, count: followedCount } = await (AccountController.accountFollowingAccountService as any)
            ._getAllWithCount(account, config);
          
          count = followedCount;
          accounts = followedResults
            .map((fa: AccountFollowingAccount) => fa.following_account)
            .filter((account: Account | undefined): account is Account => 
              account !== undefined && account.account_profile?.display_name !== null
            );

          // Filter by sharable status
          const sharableStatusIds = getSharableStatusIdsForProfileType('subscribed');
          accounts = accounts.filter(account => sharableStatusIds.includes(account.sharable_status.id));

          // Remove private information from accounts before returning
          const filteredAccounts = accounts.map(account => AccountController.removePrivateInformation(account));

          res.json({
            data: filteredAccounts,
            meta: {
              page,
              count,
              limit
            }
          });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      }, { skipMembershipStatus: true });
    });
  }

  static async getManyPublicTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManyPublicTopSchema, req, res, async () => {
      try {
        const { page, limit, offset } = getPaginationParams(req);
        const { range } = req.query as {
          range: QueryParamsStatsRange;
        };

        const orderField = getStatsOrder(range);
        const topConfig: FindManyOptions<StatsAggregatedAccount> = {
          order: { [orderField]: 'DESC' },
          skip: offset,
          take: limit,
          relations: subAccountGetManyRelations
        };
        const statsResults = await AccountController.statsAggregatedAccountService.getMany(
          topConfig,
          'global'
        );
        const accounts = statsResults.map((s: { tracked_account: Account }) => s.tracked_account).filter(Boolean);

        // Remove private information from accounts before returning
        const filteredAccounts = accounts.map(account => AccountController.removePrivateInformation(account));

        res.json({
          data: filteredAccounts,
          meta: {
            page,
            count: null,
            limit
          }
        });
      } catch (error) {
        handleGenericErrorResponse(res, error);
      }
    });
  }

  static async getManySubscribedTop(req: Request, res: Response): Promise<void> {
    validateQueryObject(getManySubscribedTopSchema, req, res, async () => {
      ensureAuthenticated(req, res, async () => {
        try {
          const { page, limit, offset } = getPaginationParams(req);
          const { range } = req.query as {
            range: QueryParamsStatsRange;
          };
          const account_id = req.user!.id;

          const accountIds = await getFollowedAccountIds(account_id);
          let accounts: Account[] = [];
          let count = 0;

          if (accountIds.length) {
            const orderField = getStatsOrder(range);
            const config: FindManyOptions<StatsAggregatedAccount> = {
              order: { [orderField]: 'DESC' },
              skip: offset,
              take: limit,
              relations: subAccountGetManyRelations
            };
            const results = await AccountController.statsAggregatedAccountService.getManyByAccountsAndCount(
              accountIds,
              config,
              'subscribed'
            );
            const statsResults = results[0];
            accounts = statsResults.map((s: { tracked_account: Account }) => s.tracked_account).filter(Boolean);
            count = results[1];
          }

          // Remove private information from accounts before returning
          const filteredAccounts = accounts.map(account => AccountController.removePrivateInformation(account));

          res.json({
            data: filteredAccounts,
            meta: {
              page,
              count,
              limit
            }
          });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      }, { skipMembershipStatus: true });
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
            display_name: string | null;
            bio: string | null;
            sharable_status: SharableStatusEnum,
            locale: string
          };
          
          const updatedAccount = await AccountController.accountService.update(account_id, dto);
          res.json(updatedAccount);
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    }, { skipMembershipStatus: false });
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
    }, { skipMembershipStatus: false });
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
    }, { skipMembershipStatus: true });
  }

  /**
   * Removes private information from an account object to prevent data leakage in public endpoints.
   * This includes removing password and email from account_credentials, and account_membership_status.
   * 
   * @param account - The account object to clean
   * @returns A new account object with private information removed
   */
  private static removePrivateInformation<T extends { account_credentials?: { password?: string; email?: string }; account_membership_status?: unknown }>(account: T): T {
    const cleanedAccount = { ...account };
    
    if (cleanedAccount.account_credentials) {
      cleanedAccount.account_credentials = { ...cleanedAccount.account_credentials };
      delete cleanedAccount.account_credentials.password;
      delete cleanedAccount.account_credentials.email;
    }
    
    if (cleanedAccount.account_membership_status) {
      delete cleanedAccount.account_membership_status;
    }
    
    return cleanedAccount;
  }
}
