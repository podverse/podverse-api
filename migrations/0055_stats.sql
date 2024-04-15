
-- Timeframe enum
CREATE TYPE timeframe_enum AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'all_time');

-- Podcasts Stats
CREATE TABLE IF NOT EXISTS stats_podcast (
    id SERIAL PRIMARY KEY,
    play_count INTEGER DEFAULT 0,
    timeframe timeframe_enum NOT NULL,
    podcast_id VARCHAR NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
    CONSTRAINT unique_timeframe_podcast UNIQUE (timeframe, podcast_id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "stats_podcast_play_count_idx" ON stats_podcast (play_count);
CREATE INDEX "stats_podcast_timeframe_idx" ON stats_podcast (timeframe);
CREATE INDEX "stats_podcast_podcast_id_idx" ON stats_podcast (podcast_id);

-- Episodes Stats
CREATE TABLE IF NOT EXISTS stats_episode (
    id SERIAL PRIMARY KEY,
    play_count INTEGER DEFAULT 0,
    timeframe timeframe_enum NOT NULL,
    episode_id VARCHAR NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    CONSTRAINT unique_timeframe_episode UNIQUE (timeframe, episode_id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "stats_episode_play_count_idx" ON stats_episode (play_count);
CREATE INDEX "stats_episode_timeframe_idx" ON stats_episode (timeframe);
CREATE INDEX "stats_episode_episode_id_idx" ON stats_episode (episode_id);

-- MediaRef Stats
CREATE TABLE IF NOT EXISTS stats_media_ref (
    id SERIAL PRIMARY KEY,
    play_count INTEGER DEFAULT 0,
    timeframe timeframe_enum NOT NULL,
    media_ref_id VARCHAR NOT NULL REFERENCES "mediaRefs"(id) ON DELETE CASCADE,
    CONSTRAINT unique_timeframe_media_ref UNIQUE (timeframe, media_ref_id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "stats_media_ref_play_count_idx" ON stats_media_ref (play_count);
CREATE INDEX "stats_media_ref_timeframe_idx" ON stats_media_ref (timeframe);
CREATE INDEX "stats_media_ref_media_ref_id_idx" ON stats_media_ref (media_ref_id);
