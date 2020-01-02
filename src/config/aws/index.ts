export default {
  queueUrls: {
    feedsToParse: {
      queueUrl: process.env.AWS_QUEUE_FEED_PARSER_URL,
      errorsQueueUrl: process.env.AWS_QUEUE_FEED_PARSER_ERRORS_URL
    }
  },
  region: process.env.AWS_REGION,
  imageS3BucketName: process.env.AWS_IMAGE_S3_BUCKET_NAME,
  imageCloudFrontOrigin: process.env.AWS_IMAGE_CLOUDFRONT_ORIGIN
}
