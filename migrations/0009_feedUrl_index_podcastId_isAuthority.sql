ALTER TABLE ONLY public."feedUrls"
    ADD CONSTRAINT "feedUrl_index_podcastId_isAuthority" UNIQUE ("podcastId", "isAuthority");
