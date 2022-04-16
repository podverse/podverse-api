ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "subtitle" character varying;

ALTER TABLE ONLY public."episodes"
    ADD COLUMN "subtitle" character varying;
