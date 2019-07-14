import { connectToDb } from '~/lib/db'
import { parseFeedUrlsFromQueue } from '~/services/parser'

(async function () {
  const connectToDbAndRunParser = async () => {
    try {
      const restartTimeOut = process.argv.length > 3 ? process.argv[3] : 10000000

      console.log('should connect')
      const connection = await connectToDb()

      if (connection && connection.isConnected) {
        console.log('should be connected')
        await parseFeedUrlsFromQueue(restartTimeOut)
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
