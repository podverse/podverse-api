CREATE MATERIALIZED VIEW "mediaRefs_videos" AS
SELECT m.*, e.id as episode_id
FROM
    "mediaRefs" m
    JOIN episodes e ON e.id = m."episodeId"
WHERE
    m."isPublic" = TRUE
    AND m."isOfficialChapter" IS NULL
    AND e."mediaType" = 'video/mp4';

CREATE UNIQUE INDEX CONCURRENTLY "mediaRefs_videos_id" ON "mediaRefs_videos" (id);
