import { Request, Response } from 'express';
import Joi from 'joi';
import { MembershipClaimTokenService } from 'podverse-orm';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';
import { ensureAuthenticated } from '@api/lib/auth';
import { validateParamsObject } from '@api/lib/validation';

const claimSchema = Joi.object({
  token: Joi.string().required()
});

export class MembershipClaimTokenController {
  private membershipClaimTokenService: MembershipClaimTokenService;

  constructor() {
    this.membershipClaimTokenService = new MembershipClaimTokenService();
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
