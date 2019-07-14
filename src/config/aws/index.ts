export default {
  queueUrls: {
    feedsToParse: {
      queueUrl: process.env.AWS_QUEUE_FEED_PARSER_URL,
      errorsQueueUrl: process.env.AWS_QUEUE_FEED_PARSER_ERRORS_URL
    }
  },
  region: process.env.AWS_REGION
}
