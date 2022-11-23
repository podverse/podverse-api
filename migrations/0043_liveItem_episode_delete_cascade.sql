ALTER TABLE ONLY public."liveItems"
    DROP CONSTRAINT "FK_liveItems_episode";

ALTER TABLE ONLY public."liveItems"
    ADD CONSTRAINT "FK_liveItems_episode" FOREIGN KEY ("episodeId") REFERENCES public.episodes(id) ON DELETE CASCADE;
