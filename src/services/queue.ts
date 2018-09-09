import { getRepository, getConnection } from 'typeorm'
import { awsConfig } from 'config'
import { FeedUrl } from 'entities'
import { chunkArray, logError } from 'utility'
import { databaseInitializer } from 'initializers/database'
import { sqs } from 'services/aws'
import { generateFeedMessageAttributes } from 'services/parser'

const feedsToParseUrl = awsConfig.queueUrls.feedsToParse

export const addAllFeedsToQueue = async (feeds, chunkSize) => {
  await databaseInitializer()

  // await purgeQueue()

  const feedUrlRepo = await getRepository(FeedUrl)

  const allFeeds = await feedUrlRepo.find({
    where: {
      isAuthority: true
    },
    relations: ['podcast']
  })

  let attributes = []
  for (const feed of allFeeds) {
    const attribute = generateFeedMessageAttributes(feed)
    attributes.push(attribute)
  }

  let entries = []
  for (let [index, key] of Array.from(attributes.entries())) {
    const entry = {
      Id: String(index),
      MessageAttributes: key,
      MessageBody: 'aws sqs requires a message body - podverse rules'
    }
    entries.push(entry)
  }

  const entryChunks = chunkArray(entries)
  for (const entryChunk of entryChunks) {
    const chunkParams = {
      Entries: entryChunk,
      QueueUrl: feedsToParseUrl
    }
    await sqs.sendMessageBatch(chunkParams)
      .promise()
      .catch(error => {
        logError('addAllFeedsToQueue: sqs.sendMessageBatch error', error)
      })
  }

  await getConnection().close()
}

export const receiveMessageFromQueue = async (queue) => {
  let params = {
    QueueUrl: queue,
    MessageAttributeNames: ['All'],
    VisibilityTimeout: 30
  }

  const message = await sqs.receiveMessage(params)
    .promise()
    .then(data => {
      if (!data.Messages || data.Messages.length === 0) {
        console.log('receiveMessageFromQueue: No messages found.')
        return
      }
      const message = data.Messages[0]
      return message
    })
    .catch(error => {
      logError('receiveMessageFromQueue: sqs.receiveMessage error', error)
    })

  return message
}

export const sendMessageToQueue = async (attrs, queue) => {
  const message = {
    MessageAttributes: attrs,
    MessageBody: 'aws sqs requires a message body - podverse rules',
    QueueUrl: queue
  }

  await sqs.sendMessage(message)
    .promise()
    .catch(error => logError('sendMessageToQueue:sqs.sendMessage', error))
}

export const deleteMessage = async receiptHandle => {
  if (receiptHandle) {
    const params = {
      QueueUrl: feedsToParseUrl,
      ReceiptHandle: receiptHandle
    }

    await sqs.deleteMessage(params)
      .promise()
      .catch(error => {
        logError('deleteMessage:sqs.deleteMessage error', error)
      })
  }
}

const purgeQueue = async () => {
  const params = { QueueUrl: feedsToParseUrl }

  await sqs.purgeQueue(params)
    .promise()
    .catch(error => {
      logError('purgeQueue.sqs.purgeQueue error', error)
    })
}
