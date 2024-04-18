import { removePodcasts } from '~/controllers/podcast'
import { connectToDb } from '~/lib/db'
;(async function () {
  const removePodcastsByIds = async () => {
    try {
      const podcastIdsString = process.argv.length > 2 ? process.argv[2] : ''

      if (!podcastIdsString) {
        console.log('Provide a comma delimited string of podcastIds as a parameter.')
        return
      }

      const podcastIds = podcastIdsString.split(',')
      const connection = await connectToDb()

      if (connection && connection.isConnected) {
        await removePodcasts(podcastIds)
      }
    } catch (error) {
      console.log(error)
    }
  }

  removePodcastsByIds()
})()
