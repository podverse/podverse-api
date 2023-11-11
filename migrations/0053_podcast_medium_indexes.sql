CREATE INDEX CONCURRENTLY "podcasts_medium_index" ON "podcasts" ("medium");

CREATE INDEX CONCURRENTLY "podcasts_medium_pastAllTimeTotalUniquePageviews_index" ON public.podcasts USING btree
("medium", "pastAllTimeTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "podcasts_medium_pastHourTotalUniquePageviews_index" ON public.podcasts USING btree
("medium", "pastHourTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "podcasts_medium_pastDayTotalUniquePageviews_index" ON public.podcasts USING btree
("medium", "pastDayTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "podcasts_medium_pastWeekTotalUniquePageviews_index" ON public.podcasts USING btree
("medium", "pastWeekTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "podcasts_medium_pastMonthTotalUniquePageviews_index" ON public.podcasts USING btree
("medium", "pastMonthTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "podcasts_medium_pastYearTotalUniquePageviews_index" ON public.podcasts USING btree
("medium", "pastYearTotalUniquePageviews");

-- 

CREATE INDEX CONCURRENTLY "playlists_medium_index" ON "playlists" ("medium");
