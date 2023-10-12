import { connectToDb } from '~/lib/db'
import { dropAndRecreateEpisodesMostRecentMaterializedView } from '~/controllers/episode'
;(async function () {
  try {
    await connectToDb()
    await dropAndRecreateEpisodesMostRecentMaterializedView()
  } catch (error) {
    console.log(error)
  }
})()
