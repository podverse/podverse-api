--
-- Name: feedUrls index_feedUrlId_isAuthority; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."feedUrls"
    ADD CONSTRAINT "index_feedUrlId_isAuthority" UNIQUE (id, "isAuthority");
