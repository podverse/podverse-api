ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "itunesFeedType" varchar;

ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "hasSeasons" boolean DEFAULT false NOT NULL;

-- TODO: I was not able to add this index to prod because the command was taking too long.
-- I think we may have to shutdown connections to the database before running this command.
-- Regardless, I don't think we actually need this index.

CREATE INDEX CONCURRENTLY "podcasts_itunesFeedType" ON "podcasts" ("itunesFeedType");
