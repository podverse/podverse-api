export type ParserRSSQueueName = 'slow' | 'fast' | 'live';
const allowedQueueNames: ParserRSSQueueName[] = ['slow', 'fast', 'live'];

export const _parserRSS = {
  allowedQueueNames
};
