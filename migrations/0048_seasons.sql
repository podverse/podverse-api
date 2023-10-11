ALTER TABLE ONLY public."episodes"
    ADD COLUMN "itunesEpisode" integer;

ALTER TABLE ONLY public."episodes"
    ADD COLUMN "itunesEpisodeType" varchar;

ALTER TABLE ONLY public."episodes"
    ADD COLUMN "itunesSeason" integer;

-- TODO: I was not able to add these indexes to prod because the commands were taking too long.
-- I think we may have to shutdown connections to the database before running the commands.
-- Regardless, I don't think we actually need these indexes.

CREATE INDEX CONCURRENTLY "episodes_itunesEpisode" ON "episodes" ("itunesEpisode");

CREATE INDEX CONCURRENTLY "episodes_itunesEpisodeType" ON "episodes" ("itunesEpisodeType");

CREATE INDEX CONCURRENTLY "episodes_itunesSeason" ON "episodes" ("itunesSeason");
