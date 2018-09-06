import { Author } from 'entities/author'
import { Category } from 'entities/category'
import { Episode } from 'entities/episode'
import { FeedUrl } from 'entities/feedUrl'
import { MediaRef } from 'entities/mediaRef'
import { Playlist } from 'entities/playlist'
import { Podcast } from 'entities/podcast'
import { User } from 'entities/user'

export default async connection => {
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
  category4.title = 'Technology'
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

  let mediaRef1 = new MediaRef()
  mediaRef1.categories = []
  mediaRef1.episodeMediaUrl = 'https://podverse.fm'
  mediaRef1.podcastFeedUrl = 'https://podverse.fm'
  mediaRef1.title = 'Beep-Beep!'
  await connection.manager.save(mediaRef1)

  let mediaRef2 = new MediaRef()
  mediaRef2.episodeMediaUrl = 'https://podverse.fm'
  mediaRef2.podcastFeedUrl = 'https://podverse.fm'
  mediaRef2.title = 'Eh, what\'s up, Doc?'
  mediaRef2.categories = [category2, category3]
  await connection.manager.save(mediaRef2)

  let mediaRef3 = new MediaRef()
  mediaRef3.episodeMediaUrl = 'https://podverse.fm'
  mediaRef3.podcastFeedUrl = 'https://podverse.fm'
  mediaRef3.title = 'Wabbits wuv carrots.'
  mediaRef3.categories = [category1, category2, category3]
  await connection.manager.save(mediaRef3)

  let mediaRef4 = new MediaRef()
  mediaRef4.episodeMediaUrl = 'https://podverse.fm'
  mediaRef4.podcastFeedUrl = 'https://podverse.fm'
  mediaRef4.title = 'Th-th-th-that\'s all, folks!'
  mediaRef4.categories = [category4]
  await connection.manager.save(mediaRef4)

  let user1 = new User()
  user1.email = 'foghorn@looney.tunes'
  user1.name = 'Foghorn Leghorn'
  await connection.manager.save(user1)

  let user2 = new User()
  user2.email = 'sylvester@looney.tunes'
  user2.name = 'Sylvester the Cat'
  await connection.manager.save(user2)

  let user3 = new User()
  user3.email = 'tweety@looney.tunes'
  user3.name = 'Tweety'
  await connection.manager.save(user3)

  let user4 = new User()
  user4.email = 'wile@looney.tunes'
  user4.name = 'Wile E. Coyote'
  await connection.manager.save(user4)

  let playlist1 = new Playlist()
  playlist1.owner = user1
  playlist1.title = 'Greatest Hits'
  await connection.manager.save(playlist1)
}
