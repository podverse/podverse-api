import { addAuthorityFeedUrlByPodcastIdToQueue } from '~/services/queue'
;(async function () {
  let podcastIds = []

  try {
    if (process.argv.length > 2) {
      let delimitedPodcastIds = process.argv[2]
      delimitedPodcastIds = delimitedPodcastIds.replace(/ |'|"|`/g, '')
      podcastIds = (delimitedPodcastIds.split(',') as never) || []
    } else {
      console.log('You must provide a list of podcastIds as a comma-delimited npm argument.')
      return
    }

    await addAuthorityFeedUrlByPodcastIdToQueue(podcastIds)
  } catch (error) {
    console.log(error)
  }
})()

// const fs = require('fs')
// import { addAuthorityFeedUrlByPodcastIdToQueue } from '~/services/queue'
// ;(async function () {
//   let podcastIds = []

//   try {
//     if (process.argv.length > 2) {
//       const csvFile = process.argv[2] // Get the CSV file from the command-line arguments
//       const fileContents = fs.readFileSync(csvFile, 'utf8') // Read the contents of the file
//       let delimitedPodcastIds = fileContents
//       delimitedPodcastIds = delimitedPodcastIds.replace(/ |'|"|`/g, '')
//       podcastIds = (delimitedPodcastIds.split(',') as never) || []
//     } else {
//       console.log('You must provide a list of podcastIds as a comma-delimited npm argument.')
//       return
//     }

//     await addAuthorityFeedUrlByPodcastIdToQueue(podcastIds)
//   } catch (error) {
//     console.log(error)
//   }
// })()
