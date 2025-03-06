import { Request, Response, NextFunction } from 'express';
import { AccountService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';

const accountService = new AccountService();

export async function ensureDevAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await accountService.get(req.user!.id, { relations: ['account_admin_roles'] });
    if (!account || !account.account_admin_roles || !account.account_admin_roles.dev_admin) {
      throw new Error('Access denied. Dev admin privileges required.');
    }
    next();
  } catch (error) {
    handleGenericErrorResponse(res, error);
  }
}

export async function ensurePodpingAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await accountService.get(req.user!.id, { relations: ['account_admin_roles'] });
    if (!account || !account.account_admin_roles || !account.account_admin_roles.podping_admin) {
      throw new Error('Access denied. Podping admin privileges required.');
    }
    next();
  } catch (error) {
    handleGenericErrorResponse(res, error);
  }
}