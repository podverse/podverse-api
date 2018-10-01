import { Connection } from 'typeorm'
import { validCategories } from 'config/categories'
import { Author, Category, Episode, FeedUrl, MediaRef, Playlist,
  Podcast, User } from 'entities'
import { parseFeed } from 'services/parser'

export const seedDatabase = async (connection: Connection) => {
  await connection.synchronize(true)

  let podcast1 = new Podcast()
  podcast1.title = 'Looney Tunes'
  await connection.manager.save(podcast1)

  let author1 = new Author()
  author1.name = 'Roadrunner'
  await connection.manager.save(author1)

  let author2 = new Author()
  author2.name = 'Bugs Bunny'
  await connection.manager.save(author2)

  let author3 = new Author()
  author3.name = 'Elmer Fudd'
  await connection.manager.save(author3)

  let author4 = new Author()
  author4.name = 'Porky Pig'
  await connection.manager.save(author4)

  let category1 = new Category()
  category1.title = 'Rocket Roller Skates'
  await connection.manager.save(category1)

  let category2 = new Category()
  category2.title = 'Viking Helmet'
  await connection.manager.save(category2)

  let category3 = new Category()
  category3.title = 'Carrots'
  await connection.manager.save(category3)

  let category4 = new Category()
  category4.categories = [category1, category2]
  category4.title = 'Props'
  await connection.manager.save(category4)

  let episode1 = new Episode()
  episode1.podcast = podcast1
  episode1.mediaUrl = 'https://podverse.fm/media/roadrunner-a-go-go.mp3'
  episode1.title = 'Roadrunner a Go-Go'
  await connection.manager.save(episode1)

  let episode2 = new Episode()
  episode2.podcast = podcast1
  episode2.mediaUrl = 'https://podverse.fm/media/mutiny-on-the-bunny.mp3'
  episode2.title = 'Mutiny on the Bunny'
  await connection.manager.save(episode2)

  let episode3 = new Episode()
  episode3.podcast = podcast1
  episode3.mediaUrl = 'https://podverse.fm/media/wise-quackers.mp3'
  episode3.title = 'Wise Quackers'
  await connection.manager.save(episode3)

  let episode4 = new Episode()
  episode4.mediaUrl = 'https://podverse.fm/media/porkys-movie-mystery.mp3'
  episode4.podcast = podcast1
  episode4.title = 'Porky\'s Movie Mystery'
  await connection.manager.save(episode4)

  let feedUrl1 = new FeedUrl()
  feedUrl1.url = 'https://podverse.fm/feeds/looney-tunes.rss'
  feedUrl1.podcast = podcast1
  feedUrl1.isAuthority = true
  await connection.manager.save(feedUrl1)

  let feedUrl2 = new FeedUrl()
  feedUrl2.url = 'https://podverse.fm/feeds/looney-tunes.uhf'
  feedUrl2.podcast = podcast1
  await connection.manager.save(feedUrl2)

  let mediaRef11 = new MediaRef()
  mediaRef11.episode = episode1
  mediaRef11.episodeMediaUrl = 'https://podverse.fm'
  mediaRef11.podcastFeedUrl = 'https://podverse.fm'
  mediaRef11.title = 'Beep'
  await connection.manager.save(mediaRef11)

  let mediaRef12 = new MediaRef()
  mediaRef12.episode = episode1
  mediaRef12.episodeMediaUrl = 'https://podverse.fm'
  mediaRef12.podcastFeedUrl = 'https://podverse.fm'
  mediaRef12.title = 'Beep'
  await connection.manager.save(mediaRef12)

  let mediaRef13 = new MediaRef()
  mediaRef13.episode = episode1
  mediaRef13.episodeMediaUrl = 'https://podverse.fm'
  mediaRef13.podcastFeedUrl = 'https://podverse.fm'
  mediaRef13.title = 'Beep'
  await connection.manager.save(mediaRef13)

  let mediaRef14 = new MediaRef()
  mediaRef14.episode = episode1
  mediaRef14.episodeMediaUrl = 'https://podverse.fm'
  mediaRef14.podcastFeedUrl = 'https://podverse.fm'
  mediaRef14.title = 'Beep'
  await connection.manager.save(mediaRef14)

  let mediaRef15 = new MediaRef()
  mediaRef15.episode = episode1
  mediaRef15.episodeMediaUrl = 'https://podverse.fm'
  mediaRef15.podcastFeedUrl = 'https://podverse.fm'
  mediaRef15.title = 'Beep'
  await connection.manager.save(mediaRef15)

  let mediaRef1 = new MediaRef()
  mediaRef1.episode = episode1
  mediaRef1.categories = []
  mediaRef1.episodeMediaUrl = 'https://podverse.fm'
  mediaRef1.podcastFeedUrl = 'https://podverse.fm'
  mediaRef1.title = 'Beep-Beep!'
  mediaRef1.authors = [author1, author2]
  await connection.manager.save(mediaRef1)

  let mediaRef2 = new MediaRef()
  mediaRef2.episode = episode1
  mediaRef2.episodeMediaUrl = 'https://podverse.fm'
  mediaRef2.podcastFeedUrl = 'https://podverse.fm'
  mediaRef2.title = 'Eh, what\'s up, Doc?'
  mediaRef2.categories = [category2, category3]
  await connection.manager.save(mediaRef2)

  let mediaRef3 = new MediaRef()
  mediaRef3.episode = episode1
  mediaRef3.episodeMediaUrl = 'https://podverse.fm'
  mediaRef3.podcastFeedUrl = 'https://podverse.fm'
  mediaRef3.title = 'Wabbits wuv carrots.'
  mediaRef3.categories = [category1, category2, category3]
  await connection.manager.save(mediaRef3)

  let mediaRef4 = new MediaRef()
  mediaRef4.episode = episode1
  mediaRef4.episodeMediaUrl = 'https://podverse.fm'
  mediaRef4.podcastFeedUrl = 'https://podverse.fm'
  mediaRef4.title = 'Th-th-th-that\'s all, folks!'
  mediaRef4.categories = [category4]
  await connection.manager.save(mediaRef4)

  let user1 = new User()
  user1.email = 'foghorn@looney.tunes'
  user1.name = 'Foghorn Leghorn'
  user1.password = 'Aa!1asdf'

  await connection.manager.save(user1)

  let user2 = new User()
  user2.email = 'sylvester@looney.tunes'
  user2.name = 'Sylvester the Cat'
  user2.password = 'Aa!1asdf'
  await connection.manager.save(user2)

  let user3 = new User()
  user3.email = 'tweety@looney.tunes'
  user3.name = 'Tweety'
  user3.password = 'Aa!1asdf'
  await connection.manager.save(user3)

  let user4 = new User()
  user4.email = 'wile@looney.tunes'
  user4.name = 'Wile E. Coyote'
  user4.password = 'Aa!1asdf'
  await connection.manager.save(user4)

  let playlist1 = new Playlist()
  playlist1.owner = user1
  playlist1.title = 'Greatest Hits'
  await connection.manager.save(playlist1)

  await generateCategories(connection, validCategories, null, true)

  // await parseFeeds()
}

const generateCategories = async (
  connection: Connection,
  data: any,
  parent: any,
  shouldSave: boolean
): Promise<any> => {
  let newCategories: any[] = []
  for (let category of data) {
    category.parent = parent
    let c = generateCategory(category)
    newCategories.push(c)

    if (category.categories && category.categories.length > 0) {
      const subCategories = await generateCategories(
        connection, category.categories, c, false
      )
      newCategories = newCategories.concat(subCategories)
    }
  }

  if (shouldSave) {
    await connection.manager.save(newCategories)
  }

  return newCategories
}

const generateCategory = (data: any) => {
  let category = new Category()
  category.title = data.title
  category.category = data.parent
  return category
}

const parseFeeds = async () => {
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
}
