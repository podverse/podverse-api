import { removeDeadEpisodes } from '~/controllers/episode'
import { connectToDb } from '~/lib/db'

(async function () {
  try {
    if (process.argv.length < 2) {
      console.log('The restartTimeout parameter is required.')
      return
    }

    const restartTimeOut = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 300000 // default is 5 minutes
    if (!restartTimeOut || restartTimeOut < 60000) {
      console.log('The restartTimeout must be >= 60000 (1 minute)')
      return
    }

    await connectToDb()
    
    const removeDeadEpisodesUntilFinished = async () => {
      const shouldContinue = await removeDeadEpisodes()
      if (shouldContinue) {
        await removeDeadEpisodesUntilFinished()
      }
    }
    
    await removeDeadEpisodesUntilFinished()

    return
  } catch (error) {
    console.log(error)
  }
})()