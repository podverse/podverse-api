CREATE MATERIALIZED VIEW "episodes_most_recent" AS
SELECT e.*, p.id as podcast_id
FROM
    "episodes" e
JOIN podcasts p ON p.id = e."podcastId"
WHERE e."isPublic" = true
	AND e."pubDate" > (NOW() - interval '14 days')
   	AND e."pubDate" < (NOW() + interval '1 days');

CREATE INDEX "IDX_episodes_most_recent" ON public."episodes_most_recent" USING btree ("podcastId");

