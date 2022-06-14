CREATE MATERIALIZED VIEW "episodes_most_recent" AS
SELECT *
FROM
    "episodes"
WHERE episodes."isPublic" = true
	AND episodes."pubDate" > (NOW() - interval '14 days')
   	AND episodes."pubDate" < (NOW() + interval '1 days');
