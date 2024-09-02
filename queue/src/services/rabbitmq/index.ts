import amqp, { Connection, Channel } from "amqplib";
import logger from '@helpers/lib/logs/logger';
import { request } from "@helpers/lib/request";
import { config } from '@queue/config';

const connectionUri = `amqp://${config.rabbitmq.username}:${config.rabbitmq.password}@${config.rabbitmq.host}:${config.rabbitmq.port}${config.rabbitmq.vhost}`;

type ParserRSSMessage = {
  url: string;
  podcast_index_id: number | null;
}

export class RabbitMQService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async initialize() {
    try {
      this.connection = await amqp.connect(connectionUri);
      this.connection.on('error', (err: unknown) => {
        logger.error(`RabbitMQ connection error: ${err}`);
      });
      this.connection.on('close', () => {
        logger.info('RabbitMQ connection closed');
      });
      this.channel = await this.connection.createChannel();
      await this.createQueues();
    } catch (error) {
      logger.error('Failed to initialize RabbitMQ connection', error);
    }
  }

  async createQueues() {
    const queueNames = config.rabbitmq.queueNames;

    for (const queueName of queueNames) {
      try {
        await this.assertQueue(queueName);
      } catch (error) {
        logger.error(`Failed to create queue ${queueName}`, error);
      }
    }
  }

  async assertQueue(queueName: string) {
    if (this.channel) {
      await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-message-ttl': 1000 * 60 * 60 * 24 * 1, // 1 day
        }
      });
      logger.info(`Queue ${queueName} is ready`);
    } else {
      logger.error('Channel is not initialized');
    }
  }

  async sendMessageParserRSS(queueName: string, message: ParserRSSMessage) {
    if (this.channel) {
      const messageString = JSON.stringify(message);
      const messageBuffer = Buffer.from(messageString);
      await this.channel.sendToQueue(queueName, messageBuffer, { persistent: true });
      logger.info(`Message sent to queue ${queueName}: ${messageString}`);
    } else {
      logger.error('Channel is not initialized');
    }
  }

  async getMessageParserRSS(queueName: string): Promise<ParserRSSMessage | null> {
    if (this.channel) {
      const msg = await this.channel.get(queueName, { noAck: false });
      if (msg) {
        const messageString = msg.content.toString();
        const message: ParserRSSMessage = JSON.parse(messageString);
        this.channel.ack(msg);
        logger.info(`Message received from queue ${queueName}: ${messageString}`);
        return message;
      } else {
        logger.info(`No messages in queue ${queueName}`);
        return null;
      }
    } else {
      logger.error('Channel is not initialized');
      return null;
    }
  }
  
  async listAllQueues(): Promise<string[]> {
    const managementUri = `http://${config.rabbitmq.host}:15672/api/queues`;

    const username = config.rabbitmq.username;
    const password = config.rabbitmq.password;

    if (!username || !password) {
      logger.error('RabbitMQ username and password are required');
      return [];
    }

    const auth = {
      username,
      password
    };

    try {
      const response = await request(managementUri, { auth });
      return response.map((queue: { name: string }) => queue.name);
    } catch (error) {
      logger.error('Failed to list queues', error);
      return [];
    }
  }

  private async deleteQueue(queueName: string) {
    if (this.channel) {
      try {
        await this.channel.deleteQueue(queueName);
        logger.info(`Queue ${queueName} deleted`);
      } catch (error) {
        logger.error(`Failed to delete queue ${queueName}`, error);
      }
    } else {
      logger.error('Channel is not initialized');
    }
  }

  async deleteAllQueues() {
    const queues = await this.listAllQueues();
    for (const queue of queues) {
      await this.deleteQueue(queue);
    }
  }
}
