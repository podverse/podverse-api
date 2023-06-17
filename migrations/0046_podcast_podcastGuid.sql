ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "podcastGuid" uuid;

CREATE INDEX idx_podcasts_podcastGuid ON "podcasts" ("podcastGuid");
