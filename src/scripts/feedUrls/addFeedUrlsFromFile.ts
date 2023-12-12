import { addFeedUrls } from 'podverse-orm'
import { connectToDb } from '~/lib/db'
const fs = require('fs')
const path = require('path')

;(async function () {
  const json = fs.readFileSync(path.resolve(__dirname, '../../config/parser/addFeedUrlsFile.json'))
  const feedUrls = JSON.parse(json)

  try {
    await connectToDb()
    await addFeedUrls(feedUrls)

    return
  } catch (error) {
    console.log(error)
  }
})()
