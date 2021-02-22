--
-- Name: userHistoryItems index_episode_owner; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userHistoryItems"
    ADD CONSTRAINT index_episode_owner UNIQUE ("episodeId", "ownerId");


--
-- Name: userHistoryItems index_mediaRef_owner; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userHistoryItems"
    ADD CONSTRAINT "index_mediaRef_owner" UNIQUE ("mediaRefId", "ownerId");
