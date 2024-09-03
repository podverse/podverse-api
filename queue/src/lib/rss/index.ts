export type QueueRSSQueueName = 'slow' | 'fast' | 'live';
const allowedQueueNames: QueueRSSQueueName[] = ['slow', 'fast', 'live'];

export const _parserRSS = {
  allowedQueueNames
};
