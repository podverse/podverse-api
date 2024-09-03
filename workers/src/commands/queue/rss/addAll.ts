import { CommandLineArgs } from "@workers/commands";
import { queueRSSAddAll as queueRSSAddAllFunction } from '@queue/functions/queue/rss/addAll';
import { _parserRSS, QueueRSSQueueName } from "@queue/lib/rss";

export const queueRSSAddAll = async (args: CommandLineArgs) => {
  const queueName = Array.isArray(args.q) ? args.q[0] : args.q;
  if (!queueName) {
    throw new Error('queueName (-q) parameter is required');
  }

  if (!_parserRSS.allowedQueueNames.includes(queueName as QueueRSSQueueName)) {
    throw new Error(`Invalid queueName. Allowed values are: ${_parserRSS.allowedQueueNames.join(', ')}`);
  }

  await queueRSSAddAllFunction({ queueName: queueName as QueueRSSQueueName });  
};
