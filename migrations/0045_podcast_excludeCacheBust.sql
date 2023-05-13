ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "excludeCacheBust" boolean DEFAULT false NOT NULL;
