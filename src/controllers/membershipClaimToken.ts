import { Request, Response } from 'express';
import Joi from 'joi';
import { AccountMembershipEnum } from 'podverse-helpers';
import { MembershipClaimTokenService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateBodyObject, validateParamsObject } from '@api/lib/validation';
import { ensureDevAdmin } from '@api/middleware/adminRoles';

const createSchema = Joi.object({
  account_membership_id: Joi.string().valid(...Object.values(AccountMembershipEnum)).required(),
  months_to_add: Joi.number().integer().min(1).required()
});

const claimSchema = Joi.object({
  token: Joi.string().required()
});

export class MembershipClaimTokenController {
  private membershipClaimTokenService: MembershipClaimTokenService;

  constructor() {
    this.membershipClaimTokenService = new MembershipClaimTokenService();
  }

  async create(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      ensureDevAdmin(req, res, async () => {
        validateBodyObject(createSchema, req, res, async () => {
          try {
            const { account_membership_id, months_to_add } = req.body;
            const membershipClaimToken = await this.membershipClaimTokenService.create(account_membership_id as AccountMembershipEnum, months_to_add);
            res.status(201).json(membershipClaimToken);
          } catch (error) {
            handleGenericErrorResponse(res, error);
          }
        });
      });
    });
  }

  async claim(req: Request, res: Response): Promise<void> {
    ensureAuthenticated(req, res, async () => {
      validateParamsObject(claimSchema, req, res, async () => {
        try {
          const account_id = req.user!.id;
          const { token } = req.params;
          await this.membershipClaimTokenService.claim(account_id, token);
          res.status(200).json({ message: 'Membership claim token successfully claimed' });
        } catch (error) {
          handleGenericErrorResponse(res, error);
        }
      });
    });
  }
}