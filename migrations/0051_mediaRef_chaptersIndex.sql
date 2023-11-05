ALTER TABLE ONLY public."mediaRefs"
    ADD COLUMN "chapterHash" uuid DEFAULT NULL;

-- Create a unique index that allows NULL for the chapterHash column
CREATE UNIQUE INDEX chapterHash_3col_unique_idx
    ON public."mediaRefs" ("episodeId", "isOfficialChapter", "chapterHash")
    WHERE "mediaRefs"."isOfficialChapter" IS TRUE
    AND "mediaRefs"."chapterHash" IS NOT NULL;

-- Drop the deprecated index
ALTER TABLE public."mediaRefs"
    DROP CONSTRAINT "mediaRef_index_episode_isOfficialChapter_startTime";
