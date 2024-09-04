import { CommandLineArgs } from "@workers/commands";
import { queueRSSRunParser as queueRSSRunParserFunction } from '@queue/functions/queue/rss/runParser';
import { QueueName, queueNames } from "@queue/services/rabbitmq";

export const queueRSSRunParser = async (args: CommandLineArgs) => {
  const queueName = Array.isArray(args.q) ? args.q[0] : args.q;
  if (!queueName) {
    throw new Error('queueName (-q) parameter is required');
  }

  if (!queueNames.includes(queueName as QueueName)) {
    throw new Error(`Invalid queueName. Allowed values are: ${queueNames.join(', ')}`);
  }

  await queueRSSRunParserFunction(queueName as QueueName);

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};
