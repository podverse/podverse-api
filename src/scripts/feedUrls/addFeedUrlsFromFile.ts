import { addFeedUrls } from '~/controllers/feedUrl'
import { connectToDb } from '~/lib/db'
const fs = require('fs');
const path = require('path');

(async function () {
  const json = fs.readFileSync(path.resolve(__dirname, '../../config/parser/feedUrlsArray.json'))
  const feedUrls = JSON.parse(json)

  try {
    await connectToDb()
    await addFeedUrls(feedUrls)

    return
  } catch (error) {
    console.log(error)
  }
})()
