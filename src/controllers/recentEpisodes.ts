import { getConnection } from 'typeorm'

const updateRecentEpisodesTables = async () => {
  const date = new Date()
  date.setDate(date.getDate() - 14)
  const dateString = date.toISOString().slice(0, 19).replace('T', ' ')
  const em = await getConnection().createEntityManager()

// Create recentEpisodesByCategory table

  await em.query(`
    CREATE TABLE "recentEpisodesByCategoryTemp" (
      LIKE "recentEpisodesByCategory" INCLUDING ALL
    );
  `)

  await em.query(`
    INSERT INTO "recentEpisodesByCategoryTemp" ("categoryId", "episodeId", "pubDate")
    SELECT COALESCE(podcasts_categories_categories."categoriesId", '0'),
    episodes.id as episodeId, episodes."pubDate" as pubDate
    FROM episodes
    LEFT JOIN podcasts_categories_categories
    ON podcasts_categories_categories."podcastsId" = episodes."podcastId"
    WHERE episodes."isPublic" = TRUE AND episodes."pubDate" > '${dateString}'
  `)

  await em.query(`
    ALTER TABLE "recentEpisodesByCategory"
    RENAME TO "recentEpisodesByCategoryOld";
  `)

  await em.query(`
    ALTER TABLE "recentEpisodesByCategoryTemp"
    RENAME TO "recentEpisodesByCategory";
  `)

  await em.query(`DROP TABLE "recentEpisodesByCategoryOld" CASCADE;`)

  // Create recentEpisodesByPodcast table

  await em.query(`
    CREATE TABLE "recentEpisodesByPodcastTemp" (
      LIKE "recentEpisodesByPodcast" INCLUDING ALL
    );
  `)

  await em.query(`
    INSERT INTO "recentEpisodesByPodcastTemp" ("podcastId", "episodeId", "pubDate")
    SELECT episodes."podcastId", episodes.id as episodeId, episodes."pubDate" as pubDate
    FROM episodes
    WHERE episodes."isPublic" = TRUE AND episodes."pubDate" > '${dateString}'
  `)

  await em.query(`
    ALTER TABLE "recentEpisodesByPodcast"
    RENAME TO "recentEpisodesByPodcastOld";
  `)

  await em.query(`
    ALTER TABLE "recentEpisodesByPodcastTemp"
    RENAME TO "recentEpisodesByPodcast";
  `)

  await em.query(`DROP TABLE "recentEpisodesByPodcastOld" CASCADE;`)
}

export {
  updateRecentEpisodesTables
}
