import { addNewFeedsFromPodcastIndex } from '~/services/podcastIndex'
;(async function () {
  try {
    await addNewFeedsFromPodcastIndex()
  } catch (error) {
    console.log(error)
  }
})()
