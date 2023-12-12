import { updateHasPodcastIndexValueTags } from 'podverse-orm'
import { connectToDb } from '~/lib/db'
import { getValueTagEnabledPodcastIdsFromPI } from '~/services/podcastIndex'
;(async function () {
  await connectToDb()

  try {
    const podcastIndexIds = await getValueTagEnabledPodcastIdsFromPI()
    await updateHasPodcastIndexValueTags(podcastIndexIds)
  } catch (error) {
    console.log(error)
  }
})()
