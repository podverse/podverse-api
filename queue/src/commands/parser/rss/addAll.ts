import { CommandLineArgs } from "@queue/commands";
import { parserRSSAddAll as parserRSSAddAllFunction } from '@queue/functions/parser/rss/addAll';
import { _parserRSS, ParserRSSQueueName } from "@queue/lib/parser/rss";

export const parserRSSAddAll = async (args: CommandLineArgs) => {
  const queueName = Array.isArray(args.q) ? args.q[0] : args.q;
  if (!queueName) {
    throw new Error('queueName (-q) parameter is required');
  }

  if (!_parserRSS.allowedQueueNames.includes(queueName as ParserRSSQueueName)) {
    throw new Error(`Invalid queueName. Allowed values are: ${_parserRSS.allowedQueueNames.join(', ')}`);
  }

  await parserRSSAddAllFunction({ queueName: queueName as ParserRSSQueueName });  
};
