import { connectToDb } from '~/lib/db'
import { parseFeedUrlsFromQueue } from '~/services/parser'

(async function () {
  const connectToDbAndRunParser = async () => {
    try {
      const priority = process.argv[2]
      const restartTimeOut = process.argv.length > 3 ? process.argv[3] : 10000000

      if (!priority) {
        console.log('You must provide a priority queue number (1-5) as a parameter.')
        return
      }
      console.log('should connect')
      const connection = await connectToDb()

      if (connection && connection.isConnected) {
        console.log('should be connected')
        await parseFeedUrlsFromQueue(priority, restartTimeOut)
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
