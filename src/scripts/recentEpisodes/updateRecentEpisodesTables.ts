import { updateRecentEpisodesTables } from 'podverse-orm'
import { connectToDb } from '~/lib/db'
;(async function () {
  try {
    await connectToDb()
    await updateRecentEpisodesTables()
  } catch (error) {
    console.log(error)
  }
})()
