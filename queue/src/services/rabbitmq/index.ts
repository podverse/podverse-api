import amqp, { Connection, Channel, ConfirmChannel } from "amqplib";
import logger from '@helpers/lib/logs/logger';
import { config } from '@queue/config';
import { rabbitMQRequest } from '@queue/services/rabbitmq/rabbitMQRequest';

export type AMQPMessage = amqp.Message;
export type QueueName = 'rss-slow' | 'rss-fast' | 'rss-live';
export const queueNames: QueueName[] = ['rss-slow', 'rss-fast', 'rss-live'];

const connectionUri = `amqp://${config.rabbitmq.username}:${config.rabbitmq.password}@${config.rabbitmq.host}:${config.rabbitmq.port}${config.rabbitmq.vhost}`;

type QueueRSSMessage = {
  url: string;
  podcast_index_id: number | null;
}

type Message = QueueRSSMessage;

export class RabbitMQService {
  private connection: Connection | null = null;
  private channel: ConfirmChannel | null = null;

  async initialize() {
    try {
      await this.connect();
    } catch (error) {
      logger.error('Failed to initialize RabbitMQ connection', error);
    }
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(connectionUri);
      this.connection.on('error', (err: unknown) => {
        logger.error(`RabbitMQ connection error: ${err}`);
        this.reconnect();
      });
      this.connection.on('close', () => {
        logger.info('RabbitMQ connection closed');
        this.reconnect();
      });
      this.channel = await this.connection.createConfirmChannel();
      // await this.createQueues();
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ', error);
      setTimeout(() => this.connect(), 5000); // Retry connection after 5 seconds
    }
  }

  private async reconnect() {
    if (this.connection) {
      try {
        await this.connection.close();
      } catch (error) {
        logger.error('Error closing RabbitMQ connection during reconnect', error);
      }
    }
    this.connection = null;
    this.channel = null;
    setTimeout(() => this.connect(), 5000); // Retry connection after 5 seconds
  }

  async createQueues() {
    for (const queueName of queueNames) {
      try {
        await this.assertQueue(queueName);
      } catch (error) {
        throw new Error(`Failed to create queue ${queueName} ${error}`);
      }
    }
  }

  async assertQueue(queueName: QueueName) {
    if (this.channel) {
      await this.channel.assertQueue(queueName, {
        durable: true,
      });
      logger.info(`Queue ${queueName} is ready`);
    } else {
      logger.error('Channel is not initialized');
    }
  }
 
  async sendMessage(queueName: QueueName, message: Message): Promise<void> {
    if (this.channel) {
      try {
        const messageString = JSON.stringify(message);
        const messageBuffer = Buffer.from(messageString);

        await new Promise<void>((resolve, reject) => {
          this.channel!.sendToQueue(queueName, messageBuffer, { persistent: true }, (err) => {
            if (err) {
              logger.error(`Failed to send message to queue ${queueName}: ${messageString}`, err);
              reject(err);
            } else {
              logger.info(`Message sent to queue ${queueName}: ${messageString}`);
              resolve();
            }
          });
        });

      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Error sending message to queue ${queueName}: ${error.message}`);
        }
      }
    } else {
      logger.error('Channel is not initialized');
    }
  }

  async getMessage(queueName: string): Promise<Message | null> {
    if (this.channel) {
      const msg = await this.channel.get(queueName, { noAck: false });
      if (msg) {
        // this.channel.ack(msg);
        const messageString = msg.content.toString();
        const message: Message = JSON.parse(messageString);
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

  async consumeMessages(queueName: QueueName, processMessage: (msg: amqp.Message) => void) {
    if (this.channel) {
      this.channel.consume(queueName, async (msg) => {
        try {
          if (msg !== null) {
            const messageContent = msg.content.toString();
            logger.info(`Received message from queue ${queueName}: ${messageContent}`);
            await processMessage(msg);
          }
        } finally {
          if (msg !== null && this.channel) {
            this.channel.ack(msg);
          }
        }
      }, { noAck: false });
      logger.info(`Consumer is set up for queue ${queueName}`);
    } else {
      logger.error('Channel is not initialized');
    }
  }
  
  async listAllQueues(): Promise<string[]> {
    try {
      const response: never[] = await rabbitMQRequest('/queues');
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
    logger.info('All queues deleted');
  }
}
