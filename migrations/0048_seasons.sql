ALTER TABLE ONLY public."episodes"
    ADD COLUMN "itunesEpisode" integer;

ALTER TABLE ONLY public."episodes"
    ADD COLUMN "itunesEpisodeType" varchar;

ALTER TABLE ONLY public."episodes"
    ADD COLUMN "itunesSeason" integer;

CREATE INDEX CONCURRENTLY "episodes_itunesEpisode" ON "episodes" ("itunesEpisode");

CREATE INDEX CONCURRENTLY "episodes_itunesEpisodeType" ON "episodes" ("itunesEpisodeType");

CREATE INDEX CONCURRENTLY "episodes_itunesSeason" ON "episodes" ("itunesSeason");
