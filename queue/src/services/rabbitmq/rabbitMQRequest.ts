import logger from '@helpers/lib/logs/logger';
import { request } from "@helpers/lib/request";
import { config } from '@queue/config';

export async function rabbitMQRequest(path: string, options: any = {}): Promise<any> {
  const managementUri = `http://${config.rabbitmq.host}:15672/api${path}`;

  const username = config.rabbitmq.username;
  const password = config.rabbitmq.password;

  if (!username || !password) {
    logger.error('RabbitMQ username and password are required');
    throw new Error('RabbitMQ username and password are required');
  }

  const auth = {
    username,
    password
  };

  try {
    const response = await request(managementUri, { ...options, auth });
    return JSON.parse(response);
  } catch (error) {
    logger.error(`Failed to make request to ${path}`, error);
    throw error;
  }
}