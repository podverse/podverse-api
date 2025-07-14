import { PayPalService } from 'podverse-external-services';
import { config } from '@api/config';

export const paypalService = new PayPalService({
  clientId: config.paypal.clientId,
  clientSecret: config.paypal.clientSecret,
  nodeEnv: config.nodeEnv
});
