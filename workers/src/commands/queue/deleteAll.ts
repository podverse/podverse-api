import { queueDeleteAll as queueDeleteAllFunction } from '@queue/functions/queue/deleteAll';

export const queueDeleteAll = async () => {
  await queueDeleteAllFunction();  
};
