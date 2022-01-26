import { syncWithFeedUrlsCSVDump } from '~/services/podcastIndex'
;(async function () {
  try {
    const rootFilePath = process.argv[2]
    await syncWithFeedUrlsCSVDump(rootFilePath || '')
  } catch (error) {
    console.log(error)
  }
})()
