export default {
  queueUrls: {
    feedsToParse: {
      priorityQueueUrl: process.env.AWS_QUEUE_FEED_PARSER_PRIORITY_URL,
      queueUrl: process.env.AWS_QUEUE_FEED_PARSER_URL,
      errorsQueueUrl: process.env.AWS_QUEUE_FEED_PARSER_ERRORS_URL
    }
  },
  region: process.env.AWS_REGION,
  imageS3BucketName: process.env.AWS_IMAGE_S3_BUCKET_NAME,
  imageCloudFrontOrigin: process.env.AWS_IMAGE_CLOUDFRONT_ORIGIN,
  backupDatbaseS3BucketName: process.env.AWS_BACKUP_DATABASE_S3_BUCKET_NAME
}
