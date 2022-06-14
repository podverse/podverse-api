CREATE MATERIALIZED VIEW "episodes_most_recent" AS
SELECT e.*
FROM
    "episodes" e
WHERE e."isPublic" = true
	AND e."pubDate" > (NOW() - interval '14 days')
   	AND e."pubDate" < (NOW() + interval '1 days');

CREATE UNIQUE INDEX CONCURRENTLY "IDX_episodes_most_recent_id" ON "episodes_most_recent" (id);

CREATE INDEX CONCURRENTLY "IDX_episodes_most_recent_podcastId_isPublic_pubDate" ON public."episodes_most_recent" USING btree ("podcastId", "isPublic", "pubDate");
