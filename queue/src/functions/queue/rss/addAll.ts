import { FeedService } from "@orm/services/feed/feed";
import { QueueName, RabbitMQService } from "@queue/services/rabbitmq";

type QueueRSSAddAllConfig = {
  queueName: QueueName;
}

export const queueRSSAddAll = async (config: QueueRSSAddAllConfig) => {
  const feedService = new FeedService();  
  const feeds = await feedService.getAll();
  
  const rabbitMQService = new RabbitMQService();
  await rabbitMQService.initialize();

  for (const feed of feeds) {
    const message = {
      url: feed.url,
      podcast_index_id: feed.channel.podcast_index_id
    };

    await rabbitMQService.sendMessage(config.queueName, message);
  }
};
