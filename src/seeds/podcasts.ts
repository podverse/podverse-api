import { parseFeedUrl } from '~/services/parser'
import { connectToDb } from '~/lib/db'
const shortid = require('shortid')

const parseFeedUrls = async () => {

  connectToDb()
    .then(async () => {
      const sampleFeedUrls = [
        {
          id: shortid.generate(),
          url: 'http://feeds.megaphone.fm/wethepeoplelive'
        },
        {
          id: shortid.generate(),
          url: 'http://joeroganexp.joerogan.libsynpro.com/rss'
        },
        // this nhl rss feed is huge, good for stress testing
        // {
        //   id: shortid.generate(),
        //   url: 'http://wild.ice.nhl.com/podcasts/pondcast.xml'
        // },
        {
          id: shortid.generate(),
          url: 'http://feeds.feedburner.com/dancarlin/history?format=xml'
        },
        {
          id: shortid.generate(),
          url: 'https://audioboom.com/channels/4954758.rss'
        },
        {
          id: shortid.generate(),
          url: 'http://h3h3roost.libsyn.com/rss'
        },
        {
          id: shortid.generate(),
          url: 'http://altucher.stansberry.libsynpro.com/rss'
        },
        {
          id: shortid.generate(),
          url: 'http://www.podcastone.com/podcast?categoryID2=1237'
        },
        {
          id: shortid.generate(),
          url: 'http://philosophizethis.libsyn.com/rss'
        },
        {
          id: shortid.generate(),
          url: 'http://feeds.feedburner.com/thetimferrissshow'
        },
        {
          id: shortid.generate(),
          url: 'http://feeds.feedburner.com/YourMomsHouseWithChristinaPazsitzkyAndTomSegura'
        },
        {
          id: shortid.generate(),
          url: 'https://ginl-podcast.s3.amazonaws.com/0_Resources/Timothy_Keller_Podcasts.xml'
        },
        {
          id: shortid.generate(),
          url: 'http://feeds.feedburner.com/pod-save-america'
        },
        {
          id: shortid.generate(),
          url: 'https://feeds.soundcloud.com/users/soundcloud:users:211911700/sounds.rss'
        },
        {
          id: shortid.generate(),
          url: 'http://feeds.feedburner.com/TheBryanCallenShow'
        },
        {
          id: shortid.generate(),
          url: 'https://www.npr.org/rss/podcast.php?id=510298'
        },
        {
          id: shortid.generate(),
          url: 'https://rss.art19.com/under-the-skin'
        },
        {
          id: shortid.generate(),
          url: 'http://wakingup.libsyn.com/rss'
        },
        {
          id: shortid.generate(),
          url: 'http://grumpyoldgeeks.libsyn.com/rss'
        },
        {
          id: shortid.generate(),
          url: 'http://fifthcolumn.podbean.com/feed/'
        },
        {
          id: shortid.generate(),
          url: 'http://feeds.feedburner.com/freakonomicsradio'
        },
        {
          id: shortid.generate(),
          url: 'https://feeds.megaphone.fm/LM9233046886'
        },
        {
          id: shortid.generate(),
          url: 'https://feeds.megaphone.fm/recodedecode'
        },
        {
          id: shortid.generate(),
          url: 'https://www.npr.org/rss/podcast.php?id=381444908'
        },
        {
          id: shortid.generate(),
          url: 'http://feeds.wnyc.org/radiolab'
        },
        {
          id: shortid.generate(),
          url: 'https://mcsorleys.barstoolsports.com/feed/pardon-my-take'
        },
        {
          id: shortid.generate(),
          url: 'http://feeds.wnyc.org/2DopeQueens'
        },
                {
          id: shortid.generate(),
          url: 'https://feeds.megaphone.fm/happier'
        },
                {
          id: shortid.generate(),
          url: 'http://feeds.feedburner.com/nerdettepodcast',
        },
        {
          id: shortid.generate(),
          url: 'https://rss.art19.com/oprah-supersoul-conversations'
        }
      ]

      for (const feedUrl of sampleFeedUrls) {
        console.log(feedUrl)
        await parseFeedUrl(feedUrl)
      }
    })
}

parseFeedUrls()
