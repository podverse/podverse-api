ALTER TABLE public."mediaRefs"
    ALTER COLUMN "isOfficialChapter" DROP NOT NULL;

ALTER TABLE public."mediaRefs"
    ALTER COLUMN "isOfficialChapter" DROP DEFAULT;

ALTER TABLE ONLY public."mediaRefs"
    ADD CONSTRAINT "mediaRef_index_episode_isOfficialChapter_startTime" UNIQUE
    ("episodeId", "isOfficialChapter", "startTime");
