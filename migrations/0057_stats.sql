
-- Timeframe enum
CREATE TYPE timeframe_enum AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'all_time');

-- Podcasts Stats
CREATE TABLE IF NOT EXISTS stats_podcast (
    id SERIAL PRIMARY KEY,
    play_count INTEGER DEFAULT 0,
    timeframe timeframe_enum NOT NULL,
    podcast_id VARCHAR NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
    CONSTRAINT unique_timeframe_podcast UNIQUE (timeframe, podcast_id),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE INDEX "stats_podcast_play_count_idx" ON stats_podcast (play_count);
CREATE INDEX "stats_podcast_timeframe_idx" ON stats_podcast (timeframe);
CREATE INDEX "stats_podcast_podcast_id_idx" ON stats_podcast (podcast_id);
CREATE INDEX "stats_podcast_updated_at" on stats_podcast ("updatedAt");

CREATE TRIGGER set_timestamps_before_insert
BEFORE INSERT ON stats_podcast
FOR EACH ROW
EXECUTE FUNCTION set_timestamps();

CREATE TRIGGER set_timestamps_before_update
BEFORE UPDATE ON stats_podcast
FOR EACH ROW
EXECUTE FUNCTION set_timestamps();

-- Episodes Stats
CREATE TABLE IF NOT EXISTS stats_episode (
    id SERIAL PRIMARY KEY,
    play_count INTEGER DEFAULT 0,
    timeframe timeframe_enum NOT NULL,
    episode_id VARCHAR NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    CONSTRAINT unique_timeframe_episode UNIQUE (timeframe, episode_id),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE INDEX "stats_episode_play_count_idx" ON stats_episode (play_count);
CREATE INDEX "stats_episode_timeframe_idx" ON stats_episode (timeframe);
CREATE INDEX "stats_episode_episode_id_idx" ON stats_episode (episode_id);
CREATE INDEX "stats_episode_updated_at" on stats_episode ("updatedAt");

CREATE TRIGGER set_timestamps_before_insert
BEFORE INSERT ON stats_episode
FOR EACH ROW
EXECUTE FUNCTION set_timestamps();

CREATE TRIGGER set_timestamps_before_update
BEFORE UPDATE ON stats_episode
FOR EACH ROW
EXECUTE FUNCTION set_timestamps();

-- MediaRef Stats
CREATE TABLE IF NOT EXISTS stats_media_ref (
    id SERIAL PRIMARY KEY,
    play_count INTEGER DEFAULT 0,
    timeframe timeframe_enum NOT NULL,
    media_ref_id VARCHAR NOT NULL REFERENCES "mediaRefs"(id) ON DELETE CASCADE,
    CONSTRAINT unique_timeframe_media_ref UNIQUE (timeframe, media_ref_id),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE INDEX "stats_media_ref_play_count_idx" ON stats_media_ref (play_count);
CREATE INDEX "stats_media_ref_timeframe_idx" ON stats_media_ref (timeframe);
CREATE INDEX "stats_media_ref_media_ref_id_idx" ON stats_media_ref (media_ref_id);
CREATE INDEX "stats_media_ref_updated_at" on stats_media_ref ("updatedAt");

CREATE TRIGGER set_timestamps_before_insert
BEFORE INSERT ON stats_media_ref
FOR EACH ROW
EXECUTE FUNCTION set_timestamps();

CREATE TRIGGER set_timestamps_before_update
BEFORE UPDATE ON stats_media_ref
FOR EACH ROW
EXECUTE FUNCTION set_timestamps();
