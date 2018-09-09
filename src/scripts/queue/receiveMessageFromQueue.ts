import { awsConfig } from 'config'
import { receiveMessageFromQueue } from 'services/queue'

receiveMessageFromQueue(awsConfig.queueUrls.feedsToParse)
