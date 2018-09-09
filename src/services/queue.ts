import { getRepository, getConnection } from 'typeorm'
import { awsConfig } from 'config'
import { FeedUrl } from 'entities'
import { chunkArray, logError } from 'utility'
import { databaseInitializer } from 'initializers/database'
import { sqs } from 'services/aws'

const feedsToParseUrl = awsConfig.queueUrls.feedsToParse

export const addAllFeedsToQueue = async (feeds, chunkSize) => {
  await databaseInitializer()

  const feedUrlRepo = await getRepository(FeedUrl)

  const allFeeds = await feedUrlRepo.find({
    where: {
      isAuthority: true
    },
    relations: ['podcast']
  })

  let attributes = []
  for (const feed of allFeeds) {
    const attribute = {
      'feedUrl': {
        DataType: 'String',
        StringValue: feed.url
      },
      'podcastId': {
        DataType: 'String',
        StringValue: feed.podcast.id
      }
    }
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

export const receiveNextFeedFromQueue = async () => {
  let params = {
    QueueUrl: feedsToParseUrl,
    MessageAttributeNames: ['All'],
    VisibilityTimeout: 30
  }

  const feedData = await sqs.receiveMessage(params)
    .promise()
    .then(data => {
      if (!data.Messages || data.Messages.length === 0) {
        console.log('parseNextFeedFromQueue: No messages found.')
        return
      }

      const message = data.Messages[0]
      const attributes = message.MessageAttributes
      const feedData = {
        feedUrl: attributes.feedUrl.StringValue,
        podcastId: attributes.podcastId.StringValue,
        receiptHandle: message.ReceiptHandle
      }

      return feedData
    })
    .catch(error => {
      logError('parseNextFeedFromQueue: sqs.receiveMessage error', error)
    })

  return feedData
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
