import { awsConfig } from 'config'
const awsRegion = awsConfig.region

const aws = require('aws-sdk')
aws.config.update({ region: awsRegion })

export const sqs = new aws.SQS()
