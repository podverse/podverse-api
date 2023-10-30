ALTER TABLE ONLY public."mediaRefs"
    ADD COLUMN "chaptersIndex" integer DEFAULT NULL;

-- Create a unique index that allows NULL for the chaptersIndex column
CREATE UNIQUE INDEX chaptersIndex_3col_unique_idx
    ON public."mediaRefs" ("episodeId", "isOfficialChapter", "chaptersIndex")
    WHERE "mediaRefs"."isOfficialChapter" IS TRUE
    AND "mediaRefs"."chaptersIndex" IS NOT NULL;

ALTER TABLE public."mediaRefs"
    DROP CONSTRAINT "mediaRef_index_episode_isOfficialChapter_startTime";
