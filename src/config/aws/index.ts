export default {
  queueUrls: {
    feedsToParse: {
      priority: {
        1: {
          queueUrl: process.env.AWS_QUEUE_FEED_PARSER_URL_1,
          errorsQueueUrl: process.env.AWS_QUEUE_FEED_PARSER_ERRORS_URL_1
        },
        2: {
          queueUrl: process.env.AWS_QUEUE_FEED_PARSER_URL_2,
          errorsQueueUrl: process.env.AWS_QUEUE_FEED_PARSER_ERRORS_URL_2
        },
        3: {
          queueUrl: process.env.AWS_QUEUE_FEED_PARSER_URL_3,
          errorsQueueUrl: process.env.AWS_QUEUE_FEED_PARSER_ERRORS_URL_3
        },
        4: {
          queueUrl: process.env.AWS_QUEUE_FEED_PARSER_URL_4,
          errorsQueueUrl: process.env.AWS_QUEUE_FEED_PARSER_ERRORS_URL_4
        },
        5: {
          queueUrl: process.env.AWS_QUEUE_FEED_PARSER_URL_5,
          errorsQueueUrl: process.env.AWS_QUEUE_FEED_PARSER_ERRORS_URL_5
        }
      }
    }
  },
  region: process.env.AWS_REGION
}
