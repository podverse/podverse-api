import { addFeedsByPodcastIndexIdToQueue } from '~/services/podcastIndex'
import { connectToDb } from '~/lib/db'
;(async function () {
  try {
    const podcastIndexIdsString = process.argv.length > 2 ? process.argv[2] : ''

    if (!podcastIndexIdsString) {
      console.log('Provide a comma delimited string of podcastIndexIds as a parameter.')
      return
    }

    const podcastIndexIds = podcastIndexIdsString.split(',')
    const connection = await connectToDb()

    if (connection && connection.isConnected) {
      console.log('should be connected')
      await addFeedsByPodcastIndexIdToQueue(connection, podcastIndexIds)
    } else {
      console.log('is not connected')
    }
  } catch (error) {
    console.log(error)
  }
})()
