-- Podcasts Stats
CREATE TABLE IF NOT EXISTS stats_podcast (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "pastDayTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastWeekTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastMonthTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastYearTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastAllTimeTotalUniquePageviews" INTEGER DEFAULT 0,
    podcast_id VARCHAR NOT NULL UNIQUE REFERENCES podcasts(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "stats_podcast_pastDayTotalUniquePageviews_idx" ON stats_podcast ("pastDayTotalUniquePageviews");
CREATE INDEX "stats_podcast_pastWeekTotalUniquePageviews_idx" ON stats_podcast ("pastWeekTotalUniquePageviews");
CREATE INDEX "stats_podcast_pastMonthTotalUniquePageviews_idx" ON stats_podcast ("pastMonthTotalUniquePageviews");
CREATE INDEX "stats_podcast_pastYearTotalUniquePageviews_idx" ON stats_podcast ("pastYearTotalUniquePageviews");
CREATE INDEX "stats_podcast_pastAllTimeTotalUniquePageviews_idx" ON stats_podcast ("pastAllTimeTotalUniquePageviews");

ALTER TABLE podcasts
ADD COLUMN stats_podcast_id VARCHAR UNIQUE;

-- Episodes Stats
CREATE TABLE IF NOT EXISTS stats_episode (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "pastDayTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastWeekTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastMonthTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastYearTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastAllTimeTotalUniquePageviews" INTEGER DEFAULT 0,
    episode_id VARCHAR NOT NULL UNIQUE REFERENCES episodes(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "stats_episode_pastDayTotalUniquePageviews_idx" ON stats_episode ("pastDayTotalUniquePageviews");
CREATE INDEX "stats_episode_pastWeekTotalUniquePageviews_idx" ON stats_episode ("pastWeekTotalUniquePageviews");
CREATE INDEX "stats_episode_pastMonthTotalUniquePageviews_idx" ON stats_episode ("pastMonthTotalUniquePageviews");
CREATE INDEX "stats_episode_pastYearTotalUniquePageviews_idx" ON stats_episode ("pastYearTotalUniquePageviews");
CREATE INDEX "stats_episode_pastAllTimeTotalUniquePageviews_idx" ON stats_episode ("pastAllTimeTotalUniquePageviews");

ALTER TABLE episodes
ADD COLUMN stats_episode_id VARCHAR UNIQUE;

-- Media Refs Stats
CREATE TABLE IF NOT EXISTS stats_media_ref (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "pastDayTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastWeekTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastMonthTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastYearTotalUniquePageviews" INTEGER DEFAULT 0,
    "pastAllTimeTotalUniquePageviews" INTEGER DEFAULT 0,
    media_ref_id VARCHAR NOT NULL UNIQUE REFERENCES "mediaRefs"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "stats_media_ref_pastDayTotalUniquePageviews_idx" ON stats_media_ref ("pastDayTotalUniquePageviews");
CREATE INDEX "stats_media_ref_pastWeekTotalUniquePageviews_idx" ON stats_media_ref ("pastWeekTotalUniquePageviews");
CREATE INDEX "stats_media_ref_pastMonthTotalUniquePageviews_idx" ON stats_media_ref ("pastMonthTotalUniquePageviews");
CREATE INDEX "stats_media_ref_pastYearTotalUniquePageviews_idx" ON stats_media_ref ("pastYearTotalUniquePageviews");
CREATE INDEX "stats_media_ref_pastAllTimeTotalUniquePageviews_idx" ON stats_media_ref ("pastAllTimeTotalUniquePageviews");

ALTER TABLE "mediaRefs"
ADD COLUMN stats_media_ref_id VARCHAR UNIQUE;
