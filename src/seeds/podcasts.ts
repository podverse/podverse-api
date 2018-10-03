import { parseFeed } from 'services/parser'
import { connectToDb } from 'lib/db';

const parseFeeds = async () => {

  connectToDb()
    .then(async () => {
      const sampleFeeds = [
        'http://feeds.megaphone.fm/wethepeoplelive',
        'http://joeroganexp.joerogan.libsynpro.com/rss',
        'http://feeds.feedburner.com/dancarlin/history?format=xml',
        'https://audioboom.com/channels/4954758.rss',
        'http://h3h3roost.libsyn.com/rss',
        'http://altucher.stansberry.libsynpro.com/rss',
        'http://www.podcastone.com/podcast?categoryID2=1237',
        'http://philosophizethis.libsyn.com/rss',
        'https://rss.art19.com/tim-ferriss-show',
        'http://feeds.feedburner.com/YourMomsHouseWithChristinaPazsitzkyAndTomSegura'
      ]
    
      for (const feed of sampleFeeds) {
        await parseFeed(feed, null, 'true')
      }
    })

}

parseFeeds()