import { parseFeed } from '~/services/parser'
import { connectToDb } from '~/lib/db'

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
        'http://feeds.feedburner.com/thetimferrissshow',
        'http://feeds.feedburner.com/YourMomsHouseWithChristinaPazsitzkyAndTomSegura',
        'https://ginl-podcast.s3.amazonaws.com/0_Resources/Timothy_Keller_Podcasts.xml',
        'http://feeds.feedburner.com/pod-save-america',
        'https://feeds.soundcloud.com/users/soundcloud:users:211911700/sounds.rss',
        'http://feeds.feedburner.com/TheBryanCallenShow',
        'https://www.npr.org/rss/podcast.php?id=510298',
        'https://rss.art19.com/under-the-skin',
        'http://wakingup.libsyn.com/rss',
        'http://grumpyoldgeeks.libsyn.com/rss',
        'http://fifthcolumn.podbean.com/feed/',
        'http://feeds.feedburner.com/freakonomicsradio',
        'http://grumpyoldgeeks.libsyn.com/rss',
        'https://feeds.megaphone.fm/LM9233046886',
        'https://feeds.megaphone.fm/recodedecode',
        'https://www.npr.org/rss/podcast.php?id=381444908',
        'http://feeds.wnyc.org/radiolab',
        'https://mcsorleys.barstoolsports.com/feed/pardon-my-take',
        'http://feeds.wnyc.org/2DopeQueens',
        'https://feeds.megaphone.fm/happier',
        'http://feeds.feedburner.com/nerdettepodcast',
        'https://rss.art19.com/oprah-supersoul-conversations'
      ]

      for (const feed of sampleFeeds) {
        await parseFeed(feed, null, 'true')
      }
    })
}

parseFeeds()
