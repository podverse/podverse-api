import { getConnection } from 'typeorm'

const days = process.env.RECENT_EPISODES_DATE_RANGE ? parseInt(process.env.RECENT_EPISODES_DATE_RANGE) : 31

const updateRecentEpisodesTables = async () => {
  const promises = [] as any
  const em = await getConnection().createEntityManager()

  await dropTempTables(em)

  for (let i = 0; i < days; i++) {
    // Why are these generated one day at a time? Revisit later.
    const byCategoryPromise = generateByCategoryQueryPromise(em, i)
    const byPodcastPromise = generateByPodcastQueryPromise(em, i)
    promises.push(byCategoryPromise)
    promises.push(byPodcastPromise)
  }

  await Promise.all(promises)

  let byCategorySelects = ''
  for (let i = 0; i < days; i++) {
    byCategorySelects += `SELECT * FROM "recentEpisodesByCategoryTemp${i}" ${i === days - 1 ? '' : 'UNION '}`
  }

  // These would be faster if the indexes were added at the end but its difficult to deal with the ever-changing index names
  // created by the CREATE TABLE LIKE process.
  await em.query(`
    CREATE TABLE "recentEpisodesByCategoryTempCombined" (
      LIKE "recentEpisodesByCategory" INCLUDING ALL
    );
  `)
  await em.query(`INSERT INTO "recentEpisodesByCategoryTempCombined" ${byCategorySelects};`)

  await em.query(`
    ALTER TABLE "recentEpisodesByCategory"
    RENAME TO "recentEpisodesByCategoryOld";
  `)

  await em.query(`
    ALTER TABLE "recentEpisodesByCategoryTempCombined"
    RENAME TO "recentEpisodesByCategory";
  `)

  await em.query(`DROP TABLE "recentEpisodesByCategoryOld" CASCADE;`)

  let byPodcastSelects = ''
  for (let i = 0; i < days; i++) {
    byPodcastSelects += `SELECT * FROM "recentEpisodesByPodcastTemp${i}" ${i === days - 1 ? '' : 'UNION '}`
  }

  await em.query(`
    CREATE TABLE "recentEpisodesByPodcastTempCombined" (
      LIKE "recentEpisodesByPodcast" INCLUDING ALL
    );
  `)
  await em.query(`INSERT INTO "recentEpisodesByPodcastTempCombined" ${byPodcastSelects};`)

  await em.query(`
    ALTER TABLE "recentEpisodesByPodcast"
    RENAME TO "recentEpisodesByPodcastOld";
  `)

  await em.query(`
    ALTER TABLE "recentEpisodesByPodcastTempCombined"
    RENAME TO "recentEpisodesByPodcast";
  `)

  await em.query(`DROP TABLE "recentEpisodesByPodcastOld" CASCADE;`)

  await dropTempTables(em)
}

const generateByCategoryQueryPromise = (em, i) => {
  return new Promise(async (resolve) => {
    await em.query(`
      CREATE TABLE "recentEpisodesByCategoryTemp${i}" (
        LIKE "recentEpisodesByCategory" EXCLUDING ALL
      );
    `)

    await em.query(`
      INSERT INTO "recentEpisodesByCategoryTemp${i}" ("categoryId", "episodeId", "pubDate")
      SELECT COALESCE(podcasts_categories_categories."categoriesId", '0'),
      episodes.id as episodeId, episodes."pubDate" as pubDate
      FROM episodes
      LEFT JOIN podcasts_categories_categories
      ON podcasts_categories_categories."podcastsId" = episodes."podcastId"
      WHERE episodes."isPublic" = TRUE
      AND episodes."pubDate" > '${getDateString(i)}'
      AND episodes."pubDate" <= '${getDateString(i, true)}'
    `)

    resolve()
  })
}

const generateByPodcastQueryPromise = (em, i) => {
  return new Promise(async (resolve) => {
    await em.query(`
      CREATE TABLE "recentEpisodesByPodcastTemp${i}" (
        LIKE "recentEpisodesByPodcast" EXCLUDING ALL
      );
    `)

    await em.query(`
      INSERT INTO "recentEpisodesByPodcastTemp${i}" ("podcastId", "episodeId", "pubDate")
      SELECT episodes."podcastId", episodes.id as episodeId, episodes."pubDate" as pubDate
      FROM episodes
      WHERE episodes."isPublic" = TRUE
      AND episodes."pubDate" > '${getDateString(i)}'
      AND episodes."pubDate" <= '${getDateString(i, true)}'
    `)

    resolve()
  })
}

const dropTempTables = async (em) => {
  for (let i = 0; i < days; i++) {
    await em.query(`DROP TABLE IF EXISTS "recentEpisodesByCategoryTemp${i}" CASCADE;`)
  }

  for (let i = 0; i < days; i++) {
    await em.query(`DROP TABLE IF EXISTS "recentEpisodesByPodcastTemp${i}" CASCADE;`)
  }

  await em.query('DROP TABLE IF EXISTS "recentEpisodesByCategoryOld";')
  await em.query('DROP TABLE IF EXISTS "recentEpisodesByCategoryTempCombined";')
  await em.query('DROP TABLE IF EXISTS "recentEpisodesByPodcastOld";')
  await em.query('DROP TABLE IF EXISTS "recentEpisodesByPodcastTempCombined";')
}

const getDateString = (i, isEndDate = false) => {
  const date = new Date()
  i = isEndDate ? i + 1 : i
  date.setDate(date.getDate() - days + i)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

export { updateRecentEpisodesTables }
