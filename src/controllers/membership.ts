import { Request, Response } from 'express';
import { config } from '@api/config';
import { handleGenericErrorResponse } from '@api/controllers/helpers/error';

export class MembershipController {
  static async getPricing(req: Request, res: Response): Promise<void> {
    try {
      if (config.premium.signupMode !== 'sign-up') {
        res.status(400).json({ message: 'Paid premium memberships are not enabled for this server' });
        return;
      }

      const freeTrialExpirationSeconds = config.premium.freeTrialExpiration;
      const freeTrialExpirationDays = Math.floor(freeTrialExpirationSeconds / 86400);
      const costMonthly = config.premium.costMonthly;
      const costAnnually = config.premium.costAnnually;
      const monthlyEquivalentAnnually = costMonthly * 12;
      const annuallySavingsPercent = Math.floor(((monthlyEquivalentAnnually - costAnnually) / monthlyEquivalentAnnually) * 100);

      const data = {
        costMonthly,
        costAnnually,
        freeTrialDurationSeconds: freeTrialExpirationSeconds,
        freeTrialDurationDays: freeTrialExpirationDays,
        annuallySavingsPercent,
        monthlyEquivalentAnnually,
      };

      res.json({ data });
    } catch (error) {
      handleGenericErrorResponse(res, error);
    }
  }
}
