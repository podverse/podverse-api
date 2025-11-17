import { RabbitMQService, RabbitMQServiceParams } from 'podverse-queue';
import { loggerService } from './loggerService';
import { config } from '@api/config';

const rabbitParams: RabbitMQServiceParams = {
  protocol: config.rabbitmq.protocol,
  host: config.rabbitmq.host,
  port: config.rabbitmq.port,
  username: config.rabbitmq.username,
  password: config.rabbitmq.password,
  vhost: config.rabbitmq.vhost
};

export const rabbitMQService = new RabbitMQService(rabbitParams, loggerService);

rabbitMQService.initialize().catch((error) => {
  loggerService.error('Failed to initialize RabbitMQService:', error);
});
