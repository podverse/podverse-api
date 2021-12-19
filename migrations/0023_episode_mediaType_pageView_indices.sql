CREATE INDEX CONCURRENTLY "IDX_8809e744be7ee07ebcb77d0e40" ON public.episodes USING btree
("mediaType", "pastAllTimeTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "IDX_cb6e0c6ebc9d77ea096c299c4f" ON public.episodes USING btree
("mediaType", "pastHourTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "IDX_1a6fc2c8e0b2401e926fdc9ea8" ON public.episodes USING btree
("mediaType", "pastDayTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "IDX_54d1c28ab0771a49dbe87b0dcc" ON public.episodes USING btree
("mediaType", "pastWeekTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "IDX_d7710685515eb9325deaba0fb6" ON public.episodes USING btree
("mediaType", "pastMonthTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "IDX_c1bc0ffc58bc3174371de14a2a" ON public.episodes USING btree
("mediaType", "pastYearTotalUniquePageviews");

CREATE INDEX CONCURRENTLY "IDX_399bc5a8d308e7c03d7d069d11" ON public.episodes USING btree
("mediaType");
