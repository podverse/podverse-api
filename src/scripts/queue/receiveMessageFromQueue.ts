import { config } from '~/config'
const { awsConfig } = config
import { receiveMessageFromQueue } from '~/services/queue'

receiveMessageFromQueue(awsConfig.queueUrls.feedsToParse)
