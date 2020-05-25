import { receiveErrorMessageFromQueue } from '~/services/queue'
const batchCount = parseInt(process.env.AWS_QUEUE_FEED_PARSER_ERRORS_BATCH_COUNT as any, 10)
receiveErrorMessageFromQueue(batchCount || 1)
