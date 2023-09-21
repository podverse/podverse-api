ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "itunesFeedType" varchar;

CREATE INDEX CONCURRENTLY "podcasts_itunesFeedType" ON "podcasts" ("itunesFeedType");

ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "hasSeasons" boolean DEFAULT false NOT NULL;
