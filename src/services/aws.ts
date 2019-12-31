import { config } from '~/config'

const { awsConfig } = config
const awsRegion = awsConfig.region

const aws = require('aws-sdk')
aws.config.update({ region: awsRegion })

export const sqs = new aws.SQS()
export const s3 = new aws.S3()
