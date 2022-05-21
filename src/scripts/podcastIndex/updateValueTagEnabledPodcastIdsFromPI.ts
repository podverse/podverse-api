import { connectToDb } from '~/lib/db'
import { updateHasPodcastIndexValueTags } from '~/controllers/podcast'
import { getValueTagEnabledPodcastIdsFromPI } from '~/services/podcastindex'
;(async function () {
  await connectToDb()

  try {
    const podcastIndexIds = await getValueTagEnabledPodcastIdsFromPI()
    await updateHasPodcastIndexValueTags(podcastIndexIds)
  } catch (error) {
    console.log(error)
  }
})()
