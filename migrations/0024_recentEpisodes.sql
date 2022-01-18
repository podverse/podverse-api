-- Adding the table creations here in case someone doesn't have them.
-- NOTE: The indexes inevitably get renamed due to CREATE TABLE LIKE process.

CREATE TABLE IF NOT EXISTS "recentEpisodesByPodcast" (
  "episodeId" character varying(14) NOT NULL,
  "podcastId" character varying(14) NOT NULL,
  "pubDate" timestamp without time zone
);

ALTER TABLE "recentEpisodesByPodcast" ADD CONSTRAINT "PK_recentEpisodesByPodcast" PRIMARY KEY ("episodeId");

CREATE INDEX "recentEpisodesByPodcast_podcastId_pubDate_idx" ON "recentEpisodesByPodcast" ("podcastId", "pubDate" DESC);

CREATE TABLE IF NOT EXISTS "recentEpisodesByCategory" (
  "episodeId" character varying(14) NOT NULL,
  "categoryId" character varying(14) NOT NULL,
  "pubDate" timestamp without time zone
);

ALTER TABLE "recentEpisodesByCategory" ADD CONSTRAINT "PK_recentEpisodesByCategory" PRIMARY KEY ("episodeId");

CREATE INDEX "recentEpisodesByCategory_categoryId_pubDate_idx" ON "recentEpisodesByCategory" ("categoryId", "pubDate" DESC);