import { RabbitMQService } from "@queue/services/rabbitmq";

export const queueDeleteAll = async () => {  
  const rabbitMQService = new RabbitMQService();
  await rabbitMQService.initialize();
  await rabbitMQService.deleteAllQueues();
};
