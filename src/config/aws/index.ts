export const awsConfig = {
  queueUrls: {
    feedsToParse: process.env.AWS_QUEUE_FEED_PARSER_URL,
    feedsToParseErrors: process.env.AWS_QUEUE_FEED_PARSER_ERRORS_URL
  },
  region: process.env.AWS_REGION
}
