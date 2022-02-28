import { connectToDb } from '~/lib/db'
import { parseFeedUrlsFromQueue } from '~/services/parser'
import { config } from '~/config'
const { awsConfig } = config

;(async function () {
  const connectToDbAndRunParser = async () => {
    try {
      if (process.argv.length <= 2) {
        console.log('The restartTimeout parameter is required.')
        console.log('Optionally provide a queueOverride parameter.')
        return
      }

      let queueUrl = awsConfig.queueUrls.feedsToParse.queueUrl
      const restartTimeOut = process.argv.length > 2 ? process.argv[2] : 900000 // default 15 minutes
      const queueOverride = process.argv.length > 3 ? process.argv[3] : ''

      if (queueOverride === 'priority') {
        queueUrl = awsConfig.queueUrls.feedsToParse.priorityQueueUrl
      } else if (queueOverride === 'live') {
        queueUrl = awsConfig.queueUrls.feedsToParse.liveQueueUrl
      }

      console.log('should connect')
      const connection = await connectToDb()

      if (connection && connection.isConnected) {
        console.log('should be connected')
        await parseFeedUrlsFromQueue(queueUrl, restartTimeOut)
      } else {
        console.log('is not connected')
        setTimeout(() => {
          connectToDbAndRunParser()
        }, 20000)
      }
    } catch (error) {
      console.log(error)
    }
  }

  connectToDbAndRunParser()
})()
