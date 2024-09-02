import { FeedService } from "@orm/services/feed/feed";
import { ParserRSSQueueName } from "@queue/lib/parser/rss";
import { RabbitMQService } from "@queue/services/rabbitmq";

type ParserRSSFeedsAddAllConfig = {
  queueName: ParserRSSQueueName;
}

export const parserRSSAddAll = async (config: ParserRSSFeedsAddAllConfig) => {
  const feedService = new FeedService();  
  const feeds = await feedService.getAll();
  
  const rabbitMQService = new RabbitMQService();
  await rabbitMQService.initialize();

  for (const feed of feeds) {
    const message = {
      url: feed.url,
      podcast_index_id: feed.channel.podcast_index_id
    };

    await rabbitMQService.sendMessageParserRSS(config.queueName, message);
  }
};
