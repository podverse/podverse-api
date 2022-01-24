import { connectToDb } from '~/lib/db'
import { parseFeedUrlsByPodcastIds } from '~/services/parser'
;(async function () {
  const connectToDbAndRunParser = async () => {
    try {
      const podcastIdsString = process.argv.length > 2 ? process.argv[2] : ''

      if (!podcastIdsString) {
        console.log('Provide a comma delimited string of podcastIds as a parameter.')
        return
      }

      const podcastIds = podcastIdsString.split(',')
      const connection = await connectToDb()

      if (connection && connection.isConnected) {
        console.log('should be connected')
        await parseFeedUrlsByPodcastIds(podcastIds)
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
