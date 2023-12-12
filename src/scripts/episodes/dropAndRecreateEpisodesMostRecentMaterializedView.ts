import { dropAndRecreateEpisodesMostRecentMaterializedView } from 'podverse-orm'
import { connectToDb } from '~/lib/db'
;(async function () {
  try {
    await connectToDb()
    await dropAndRecreateEpisodesMostRecentMaterializedView()
  } catch (error) {
    console.log(error)
  }
})()
