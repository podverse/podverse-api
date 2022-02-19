ALTER TABLE ONLY public."episodes"
    ADD COLUMN "contentsLinks" text;

ALTER TABLE ONLY public."episodes"
    ADD COLUMN "isLiveItem" boolean DEFAULT false NOT NULL;
