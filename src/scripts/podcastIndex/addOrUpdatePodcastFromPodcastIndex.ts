import { addOrUpdatePodcastFromPodcastIndex } from '~/services/podcastIndex'
import { connectToDb } from '~/lib/db'
;(async function () {
  const connectToDbAndRunParser = async () => {
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
        for (const podcastIndexId of podcastIndexIds) {
          try {
            await addOrUpdatePodcastFromPodcastIndex(connection, podcastIndexId)
          } catch (error) {
            console.log('error')
          }
        }
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
