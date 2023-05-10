ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "parsingPriority" integer DEFAULT 0 NOT NULL;

CREATE INDEX CONCURRENTLY "podcasts_parsingPriority" ON "podcasts" ("parsingPriority");
