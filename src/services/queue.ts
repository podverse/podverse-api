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
      .innerJoinAndSelect(
        'feedUrl.podcast',
        'podcast',
        'podcast.isPublic = :isPublic',
        { isPublic: true }
      )
      .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NOT NULL')

    const feedUrls = await qb.getMany()

    await sendFeedUrlsToQueue(feedUrls, queueUrls.feedsToParse.queueUrl)
  } catch (error) {
    console.log('queue:addAllPublicFeedUrlsToQueue', error)
  }
}

export const addAllOrphanFeedUrlsToPriorityQueue = async () => {

  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    const feedUrls = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .leftJoin('feedUrl.podcast', 'podcast')
      .where('feedUrl.isAuthority = true AND feedUrl.podcast IS NULL')
      .getMany()

    await sendFeedUrlsToQueue(feedUrls, queueUrls.feedsToParse.priorityQueueUrl)
  } catch (error) {
    console.log('queue:addAllOrphanFeedUrlsToPriorityQueue', error)
  }
}

export const addFeedUrlsByFeedIdToQueue = async (feedUrlIds) => {

  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    const feedUrls = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .leftJoinAndSelect('feedUrl.podcast', 'podcast')
      .where(
        'feedUrl.isAuthority = true AND feedUrl.id IN (:...feedUrlIds)',
        { feedUrlIds }
      )
      .getMany()

    console.log('Total feedUrls found:', feedUrls.length)

    await sendFeedUrlsToQueue(feedUrls, queueUrls.feedsToParse.queueUrl)
  } catch (error) {
    console.log('queue:addFeedUrlsByFeedIdToQueue', error)
  }
}

export const addFeedUrlsByAuthorityIdToPriorityQueue = async (authorityIds: string[]) => {

  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    const feedUrls = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .leftJoinAndSelect('feedUrl.podcast', 'podcast')
      .where(
        'feedUrl.isAuthority = true AND podcast.authorityId IN (:...authorityIds)',
        { authorityIds }
      )
      .getMany()

    console.log('Total feedUrls found:', feedUrls.length)

    await sendFeedUrlsToQueue(feedUrls, queueUrls.feedsToParse.priorityQueueUrl)
  } catch (error) {
    console.log('queue:addFeedUrlsByAuthorityIdToPriorityQueue', error)
  }
}

export const addNonAuthorityFeedUrlsToQueue = async () => {

  await connectToDb()

  try {
    const feedUrlRepo = getRepository(FeedUrl)

    const feedUrls = await feedUrlRepo
      .createQueryBuilder('feedUrl')
      .select('feedUrl.id')
      .addSelect('feedUrl.url')
      .leftJoinAndSelect('feedUrl.podcast', 'podcast')
      .where(`feedUrl.isAuthority = true AND coalesce(TRIM(podcast.authorityId), '') = ''`)
      .getMany()

    console.log('Total feedUrls found:', feedUrls.length)

    await sendFeedUrlsToQueue(feedUrls, queueUrls.feedsToParse.priorityQueueUrl)
  } catch (error) {
    console.log('queue:addNonAuthorityFeedUrlsToQueue', error)
  }
}

export const sendFeedUrlsToQueue = async (feedUrls, queueUrl) => {
  const attributes = []
  for (const feedUrl of feedUrls) {
    const attribute = generateFeedMessageAttributes(feedUrl) as never
    attributes.push(attribute)
  }

  const entries = []
  for (const [index, key] of Array.from(attributes.entries())) {
    const entry = {
      Id: String(index),
      MessageAttributes: key,
      MessageBody: 'aws sqs requires a message body - podverse rules'
    } as never
    entries.push(entry)
  }

  const entryChunks = chunkArray(entries)
  const messagePromises = [] as any
  for (const entryChunk of entryChunks) {
    const chunkParams = {
      Entries: entryChunk,
      QueueUrl: queueUrl
    }

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

export const receiveErrorMessageFromQueue = async (count: number) => {
  console.log('')
  console.log('---')
  console.log('')
  console.log('START receiveErrorMessageFromQueue')
  console.log('')
  for (let i = 1; i <= count; i++) {
    console.log('')
    console.log('*** Message #' + i + ' ***')
    console.log('')
    const msg = await receiveMessageFromQueue(queueUrls.feedsToParse.errorsQueueUrl)
    if (msg) {
      if (msg.MessageAttributes) {
        if (msg.MessageAttributes.url) {
          console.log('url:', msg.MessageAttributes.url.StringValue)
          console.log('')
        }
        if (msg.MessageAttributes.id) {
          console.log('feedUrlId:', msg.MessageAttributes.id.StringValue)
          console.log('')
        }
        if (msg.MessageAttributes.podcastTitle) {
          console.log('podcastTitle:', msg.MessageAttributes.podcastTitle.StringValue)
          console.log('')
        }
        if (msg.MessageAttributes.podcastId) {
          console.log('podcastId:', msg.MessageAttributes.podcastId.StringValue)
          console.log('')
        }
        if (msg.MessageAttributes.errorMessage) {
          console.log('errorMessage:', msg.MessageAttributes.errorMessage.StringValue)
          console.log('')
        }
      }
      console.log('')
      await deleteMessage(queueUrls.feedsToParse.errorsQueueUrl, msg.receiptHandle)
    } else {
      console.log('no message found')
      console.log('')
    }
  }
  console.log('END receiveErrorMessageFromQueue')
  console.log('')
}

export const receiveMessageFromQueue = async queue => {
  const params = {
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

export const deleteMessage = async (queueUrl, receiptHandle) => {
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
