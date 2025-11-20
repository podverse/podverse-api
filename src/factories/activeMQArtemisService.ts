import { ActiveMQArtemisService, ActiveMQArtemisServiceParams } from 'podverse-mq';
import { loggerService } from './loggerService';
import { config } from '@api/config';

const activeMQArtemisParams: ActiveMQArtemisServiceParams = {
  protocol: config.activeMQArtemis.protocol,
  host: config.activeMQArtemis.host,
  port: config.activeMQArtemis.port,
  username: config.activeMQArtemis.username,
  password: config.activeMQArtemis.password
};

export const activeMQArtemisService = new ActiveMQArtemisService(activeMQArtemisParams, loggerService);

activeMQArtemisService.initialize().catch((error) => {
  loggerService.error('Failed to initialize ActiveMQArtemisService:', error);
});
