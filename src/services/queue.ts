import { getRepository } from 'typeorm'
import { config } from '~/config'
import { FeedUrl } from '~/entities'
import { chunkArray } from '~/lib/utility'
import { connectToDb } from '~/lib/db'
import { sqs } from '~/services/aws'
import { generateFeedMessageAttributes } from '~/services/parser'

const { awsConfig } = config
const queueUrls = awsConfig.queueUrls

export const addAllPublicFeedUrlsToQueue = async () => {
  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)
    const qb = feedUrlRepo.createQueryBuilder('feedUrl')

    qb.select('feedUrl.id')
      .addSelect('feedUrl.url')
      .innerJoin(
        'feedUrl.podcast',
        'podcast',
        'podcast.isPublic = :isPublic',
        { isPublic: true }
      )
      .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NOT NULL')

    const feedUrls = await qb.getMany()

    await sendFeedUrlsToParsingQueue(feedUrls)
  } catch (error) {
    console.log('queue:addAllPublicFeedUrlsToQueue', error)
  }
}

export const addAllOrphanFeedUrlsToQueue = async () => {

  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    let feedUrls = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .leftJoin('feedUrl.podcast', 'podcast')
      .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NULL')
      .getMany()

    await sendFeedUrlsToParsingQueue(feedUrls)
  } catch (error) {
    console.log('queue:addAllOrphanFeedUrlsToQueue', error)
  }
}

export const sendFeedUrlsToParsingQueue = async (feedUrls) => {
  const queueUrl = queueUrls.feedsToParse.queueUrl

  let attributes = []
  for (const feedUrl of feedUrls) {
    const attribute = generateFeedMessageAttributes(feedUrl) as never
    attributes.push(attribute)
  }

  let entries = []
  for (let [index, key] of Array.from(attributes.entries())) {
    const entry = {
      Id: String(index),
      MessageAttributes: key,
      MessageBody: 'aws sqs requires a message body - podverse rules'
    } as never
    entries.push(entry)
  }

  const entryChunks = chunkArray(entries)
  let messagePromises = []
  for (const entryChunk of entryChunks) {
    const chunkParams = {
      Entries: entryChunk,
      QueueUrl: queueUrl
    }

    // @ts-ignore
    messagePromises.push(sqs.sendMessageBatch(chunkParams).promise())
  }

  Promise.all(messagePromises)
    .catch(error => {
      console.error('addAllFeedsToQueue: sqs.sendMessageBatch error', error)
    })
}

export const sendMessageToQueue = async (attrs, queue) => {
  const message = {
    MessageAttributes: attrs,
    MessageBody: 'aws sqs requires a message body - podverse rules',
    QueueUrl: queue
  }

  await sqs.sendMessage(message)
    .promise()
    .catch(error => console.error('sendMessageToQueue:sqs.sendMessage', error))
}

export const receiveMessageFromQueue = async queue => {
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
      console.error('receiveMessageFromQueue: sqs.receiveMessage error', error)
    })

  return message
}

export const deleteMessage = async (receiptHandle) => {
  const queueUrl = queueUrls.feedsToParse.queueUrl

  if (receiptHandle) {
    const params = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle
    }

    await sqs.deleteMessage(params)
      .promise()
      .catch(error => {
        console.error('deleteMessage:sqs.deleteMessage error', error)
      })
  }
}

export const purgeQueue = async () => {
  const queueUrl = queueUrls.feedsToParse.queueUrl
  const params = { QueueUrl: queueUrl }

  await sqs.purgeQueue(params)
    .promise()
    .catch(error => {
      console.error('purgeQueue.sqs.purgeQueue error', error)
    })
}
