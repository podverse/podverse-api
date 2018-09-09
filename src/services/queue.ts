import { awsConfig } from 'config'
import { chunkArray } from 'utility'
import { sqs } from 'services/aws'

export const addAllFeedsToQueue = (feeds, chunkSize) => {
  const allFeeds = [
    {url: '1234', podcast: { id: 'adsf' }},
    {url: '1234', podcast: { id: 'adsf' }},
    {url: '1234', podcast: { id: 'adsf' }},
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } },
    { url: '1234', podcast: { id: 'adsf' } }
  ]

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
      QueueUrl: awsConfig.queueUrls.feedsToParse
    }

    sqs.sendMessageBatch(chunkParams, (err, data) => {
      if (err) {
        console.log(err, err.stack)
      }
    })
  }
}
