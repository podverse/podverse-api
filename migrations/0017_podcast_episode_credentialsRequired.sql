ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "credentialsRequired" boolean DEFAULT false NOT NULL;

ALTER TABLE ONLY public."episodes"
    ADD COLUMN "credentialsRequired" boolean DEFAULT false NOT NULL;
