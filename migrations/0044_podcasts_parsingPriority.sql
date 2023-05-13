ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "parsingPriority" integer DEFAULT 0 NOT NULL;

CREATE INDEX CONCURRENTLY "podcasts_parsingPriority" ON "podcasts" ("parsingPriority");

CREATE INDEX CONCURRENTLY "IDX_podcasts_parsingPriority_isPublic" ON public."podcasts" USING btree ("isPublic", "parsingPriority");
