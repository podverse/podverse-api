import * as parsePodcast from 'node-podcast-parser'
import * as request from 'request'
import { getRepository, getConnection, In } from 'typeorm'
import { Author, Category, Episode, FeedUrl, Podcast }
  from 'entities'
import { logError } from 'utility'
import { databaseInitializer } from 'initializers/database'

export const parseFeed = async (url, id, shouldCreate, shouldConnectToDb = true) => {

  if (shouldConnectToDb) {
    await databaseInitializer()
  }

  request(url, async (error, res, data) => {
    if (error) {
      logError(error, 'Network error', { id, url, shouldCreate })
      if (shouldConnectToDb) {
        await getConnection().close()
      }
      return
    }

    parsePodcast(data, async (error, data) => {
      if (error) {
        logError(error, 'Parsing error', { id, url, shouldCreate })
        if (shouldConnectToDb) {
          await getConnection().close()
        }
        return
      }

      const podcastRepo = await getRepository(Podcast)

      let podcast
      if (shouldCreate === 'true') {
        const feedUrl = new FeedUrl()
        feedUrl.url = url
        podcast = new Podcast()
        feedUrl.podcast = podcast
        podcast.feedUrls = [feedUrl]
      } else {
        podcast = await podcastRepo.findOne({ id })
        if (!podcast) {
          logError(
            'Parsing error: No podcast found matching id',
            null,
            { id, url, shouldCreate }
          )
          if (shouldConnectToDb) {
            await getConnection().close()
          }
          return
        }
      }

      let authors = []
      if (data.author) {
        authors = await findOrGenerateAuthors(data.author)
      }
      podcast.authors = authors

      let categories = []
      if (data.categories) {
        categories = await findCategories(data.categories)
      }
      podcast.categories = categories

      podcast.episodes = await findOrGenerateParsedEpisodes(data.episodes, podcast)

      if (data.description && data.description.long) {
        podcast.description = data.description.long
      }

      podcast.feedLastUpdated = data.updated
      podcast.imageUrl = data.image
      podcast.isExplicit = data.explicit
      podcast.guid = data.guid
      podcast.language = data.language
      podcast.linkUrl = data.link
      podcast.title = data.title
      podcast.type = data.type

      await podcastRepo.save(podcast)

      if (shouldConnectToDb) {
        await getConnection().close()
      }
    })
  })
}

const findOrGenerateAuthors = async (authorNames) => {
  const authorRepo = await getRepository(Author)
  let allAuthorNames = authorNames.split(',').map(x => x.trim())

  const existingAuthors = await authorRepo.find({
    where: {
      name: In(allAuthorNames)
    }
  })

  let newAuthors = []
  let existingAuthorNames = existingAuthors.map(x => x.name)
  let newAuthorNames = allAuthorNames.filter(x => !existingAuthorNames.includes(x))

  for (const name of newAuthorNames) {
    let author = generateAuthor(name)
    newAuthors.push(author)
  }

  const allAuthors = existingAuthors.concat(newAuthors)

  return allAuthors
}

const generateAuthor = name => {
  let author = new Author()
  author.name = name
  return author
}

const findCategories = async categories => {
  const categoryRepo = await getRepository(Category)
  categories = await categoryRepo.find({
    where: {
      title: In(categories)
    }
  })
  return categories
}

const assignParsedEpisodeData = async (episode, parsedEpisode, podcast) => {
  episode.description = parsedEpisode.description
  episode.duration = parsedEpisode.duration
  episode.episodeType = parsedEpisode.episodeType
  episode.guid = parsedEpisode.guid
  episode.imageUrl = parsedEpisode.image
  episode.isExplicit = parsedEpisode.explicit
  episode.mediaFilesize = parsedEpisode.enclosure.filesize
  episode.mediaType = parsedEpisode.enclosure.type
  episode.mediaUrl = parsedEpisode.enclosure.url
  episode.pubDate = parsedEpisode.published
  episode.title = parsedEpisode.title

  let authors = []
  if (parsedEpisode.author) {
    authors = await findOrGenerateAuthors(parsedEpisode.author)
  }
  episode.authors = authors

  let categories = []
  if (parsedEpisode.categories) {
    categories = await findCategories(parsedEpisode.categories)
  }
  episode.categories = categories

  episode.podcast = podcast

  return episode
}

const findOrGenerateParsedEpisodes = async (parsedEpisodes, podcast) => {
  const episodeRepo = await getRepository(Episode)  
  const allEpisodeMediaUrls = parsedEpisodes.map(x => x.enclosure.url)

  const existingEpisodes = await episodeRepo.find({
    where: {
      mediaUrl: In(allEpisodeMediaUrls)
    }
  })

  const existingEpisodeMediaUrls = existingEpisodes.map(x => x.mediaUrl)
  const newParsedEpisodes = parsedEpisodes.filter(
    x => !existingEpisodeMediaUrls.includes(x.enclosure.url)
  )

  const allEpisodes = []
  for (let existingEpisode of existingEpisodes) {
    let parsedEpisode = parsedEpisodes.find(
      x => x.enclosure.url === existingEpisode.mediaUrl
    )
    existingEpisode = await assignParsedEpisodeData(existingEpisode, parsedEpisode, podcast)
    allEpisodes.push(existingEpisode)
  }

  for (const newParsedEpisode of newParsedEpisodes) {
    let episode = new Episode()
    episode = await assignParsedEpisodeData(episode, newParsedEpisode, podcast)
    allEpisodes.push(episode)
  }

  return allEpisodes
}
